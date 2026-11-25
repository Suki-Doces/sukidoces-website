import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule ,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NgxMaskDirective } from 'ngx-mask';

// IMPORTAÇÕES DE SEGURANÇA E AMBIENTE
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { CheckoutService } from 'src/app/core/services/checkout.service';

import { CartService } from 'src/app/core/services/cart.service';
import { OrderService } from 'src/app/core/services/order.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
    selector: 'app-checkout',
    imports: [CommonModule, RouterModule, ReactiveFormsModule, NgxMaskDirective],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  salvandoDados = false; // Controla o estado de auto-save em background
  isLoading = false;
  errorMessage = '';
  user: any;

  // Controle de Telas (1: Endereço, 2: Pagamento)
  currentStep: number = 1;

  // Carrinho
  cartItems: any[] = [];
  subtotal = 0;
  private checkoutIdempotencyKey: string | null = null;
  frete = 0;
  freteGratis = false;
  /** true quando o servidor já respondeu o frete do destino atual. */
  freteCalculado = false;
  private freteSub?: Subscription;

  // Cupom
  codigoCupom = '';
  desconto = 0;
  cupomAplicado = false;
  cupomMensagem = '';
  cupomErro = false;
  validandoCupom = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private http: HttpClient,
    // SERVIÇOS INJETADOS PARA SEGURANÇA
    private authService: AuthService,
    private checkoutService: CheckoutService
  ) { }

  ngOnInit(): void {
    // 1. Inicializa o formulário
    this.checkoutForm = this.fb.group({
      nome: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      telefone: ['', Validators.required],
      cep: ['', Validators.required],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      metodo_pagamento: ['pix', Validators.required],
      // Campos do Cartão
      card_number: [''],
      card_name: [''],
      card_expiry: [''],
      card_cvv: [''],
      parcelas: ['1']
    });

    this.isLoading = true;

    // 2. Busca na base de dados
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        const userData = res.user || res;
        this.user = userData;

        console.log('📦 Dados recebidos da API no Checkout:', userData);

        if (userData) {
          let cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = '';
          const enderecoBruto = userData.endereco || userData.enderecos;

          if (enderecoBruto) {
            try {
              const addrArray = typeof enderecoBruto === 'string' ? JSON.parse(enderecoBruto) : enderecoBruto;

              if (Array.isArray(addrArray)) {
                if (typeof addrArray[0] === 'string') {
                  cep = addrArray[0] || '';
                  rua = addrArray[1] || '';
                  numero = addrArray[2] || '';
                  complemento = addrArray[3] || '';
                  bairro = addrArray[4] || '';

                  if (addrArray[5]) {
                    const partes = addrArray[5].split(' - ');
                    cidade = partes[0] ? partes[0].trim() : '';
                    estado = partes[1] ? partes[1].trim() : '';
                  }
                } else if (addrArray.length > 0 && addrArray[0].cep) {
                  const addr = addrArray[0];
                  cep = addr.cep || '';
                  rua = addr.logradouro || addr.rua || '';
                  numero = addr.numero || '';
                  complemento = addr.complemento || '';
                  bairro = addr.bairro || '';
                  cidade = addr.cidade || '';
                  estado = addr.estado || '';
                }
              }
            } catch (e) {
              console.error('❌ Erro de segurança: Parse do endereço falhou.', e);
            }
          }

          this.checkoutForm.patchValue({
            nome: userData.nome || '',
            email: userData.email || '',
            cpf: userData.cpf || '',
            telefone: userData.telefone || '',
            cep, rua, numero, complemento, bairro, cidade, estado
          });

          this.calcularFrete();

          if (this.isDadosCompletos()) {
            this.currentStep = 2;
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao buscar os dados do utilizador:', err);
        this.isLoading = false;
      }
    });

    // 3. Atualiza Subtotal e Taxa de Entrega
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.subtotal = items.reduce((sum, i) => sum + (i.product.preco * i.quantity), 0);
      this.calcularFrete();
    });
  }

  setPaymentMethod(method: string) {
    this.checkoutForm.get('metodo_pagamento')?.setValue(method);
    const cardFields = ['card_number', 'card_name', 'card_expiry', 'card_cvv'];

    if (method === 'cartao') {
      cardFields.forEach(f => this.checkoutForm.get(f)?.setValidators(Validators.required));
    } else {
      cardFields.forEach(f => this.checkoutForm.get(f)?.clearValidators());
    }
    cardFields.forEach(f => this.checkoutForm.get(f)?.updateValueAndValidity());
  }

  private isDadosCompletos(): boolean {
    const raw = this.checkoutForm.getRawValue();
    return !!(
      raw.cpf?.trim() && raw.telefone?.trim() && raw.cep?.trim() &&
      raw.rua?.trim() && raw.numero?.trim() && raw.bairro?.trim() &&
      raw.cidade?.trim() && raw.estado?.trim()
    );
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.desconto) + this.frete;
  }

  /**
   * O frete é calculado pelo servidor (POST /frete/calcular): ele é a única fonte da regra e é o mesmo
   * valor que será gravado no pedido. Aqui só mostramos o resultado.
   */
  calcularFrete(): void {
    const estado = (this.checkoutForm.get('estado')?.value || '').trim().toUpperCase();
    const cidade = (this.checkoutForm.get('cidade')?.value || '').trim();

    this.freteSub?.unsubscribe();
    this.frete = 0;
    this.freteGratis = false;
    this.freteCalculado = false;

    // Sem estado (ou, em SP, sem cidade) não há como calcular.
    if (!estado || (estado === 'SP' && !cidade)) return;

    this.freteSub = this.http
      .post<any>(`${environment.apiUrl}/frete/calcular`, { subtotal: this.subtotal, estado, cidade })
      .subscribe({
        next: (res) => {
          this.frete = Number(res.frete) || 0;
          this.freteGratis = !!res.frete_gratis;
          this.freteCalculado = true;
        },
        error: () => {
          this.frete = 0;
          this.freteGratis = false;
          this.freteCalculado = false;
          this.errorMessage = 'Não foi possível calcular o frete agora. Tente novamente.';
        }
      });
  }

  buscarCep(): void {
    let cep = this.checkoutForm.get('cep')?.value;
    if (cep) {
      cep = cep.replace(/\D/g, '');
      if (cep.length === 8) {
        this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
          next: (data: any) => {
            if (!data.erro) {
              this.checkoutForm.patchValue({
                rua: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf
              });
              this.calcularFrete();
              // Chama o Auto-Save mal o CEP preencha os dados
              this.autoSalvarUsuario();
            }
          }
        });
      }
    }
  }

  // NOVA FUNÇÃO: AUTO-SAVE EM BACKGROUND
  autoSalvarUsuario(): void {
    if (this.isDadosCompletos()) {
      this.salvandoDados = true;
      this.salvarUsuarioNoBanco()
        .then(() => {
          console.log('✅ Dados salvos automaticamente em background');
          this.salvandoDados = false;
        })
        .catch(err => {
          console.error('❌ Erro no auto-save:', err);
          this.salvandoDados = false;
        });
    }
  }

  async prosseguirParaPagamento(): Promise<void> {
    this.errorMessage = ''; // Limpa erros antigos

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios a vermelho.';

      // Ajuda para o programador: Mostra no console qual campo está a falhar
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const controlErrors = this.checkoutForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log(`❌ Campo inválido: ${key}`, controlErrors);
        }
      });
      return;
    }

    this.isLoading = true;
    try {
      await this.salvarUsuarioNoBanco();
      this.calcularFrete();
      this.currentStep = 2;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Erro no checkout:', error);
      this.errorMessage = 'Ocorreu um erro ao guardar o endereço. Verifique a ligação e tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  voltarParaEndereco(): void {
    this.currentStep = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private salvarUsuarioNoBanco(): Promise<any> {
    const formValue = this.checkoutForm.getRawValue();
    const idEnderecoAtual = this.user?.id_endereco_atual || this.user?.enderecos?.[0]?.id_endereco;
    let enderecosPayload: any = {};

    if (idEnderecoAtual) {
      enderecosPayload = {
        update: {
          where: { id_endereco: idEnderecoAtual },
          data: {
            cep: formValue.cep, logradouro: formValue.rua, numero: formValue.numero,
            complemento: formValue.complemento, bairro: formValue.bairro,
            cidade: formValue.cidade, estado: formValue.estado
          }
        }
      };
    } else {
      enderecosPayload = {
        create: {
          cep: formValue.cep, logradouro: formValue.rua, numero: formValue.numero,
          complemento: formValue.complemento, cidade: formValue.cidade, estado: formValue.estado
        }
      };
    }

    // Os dados agora seguem perfeitamente o formato da interface UsuarioCheckout
    const dadosParaAtualizar = {
      nome: formValue.nome,
      telefone: formValue.telefone,
      cpf: formValue.cpf,
      enderecos: enderecosPayload
    };

    return new Promise((resolve, reject) => {
      // 👇 AQUI ESTÁ A MUDANÇA: Passou a usar o CheckoutService de forma segura 👇
      this.checkoutService.autoSalvarUsuario(dadosParaAtualizar).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err)
      });
    });
  }

  validarCupom(): void {
    if (!this.codigoCupom.trim()) return;

    this.validandoCupom = true;
    this.cupomMensagem = '';
    this.cupomErro = false;

    // 🛡️ SEGURANÇA 2 (environment): Uso dinâmico da URL segura.
    const urlSegura = `${environment.apiUrl}/cupons/validar`;

    this.http.post<any>(urlSegura, { codigo: this.codigoCupom.toUpperCase().trim(), subtotal: this.subtotal }).subscribe({
      next: (res) => {
        this.desconto = res.valor_desconto || 0;
        this.cupomAplicado = true;
        this.cupomMensagem = `Cupom "${this.codigoCupom.toUpperCase()}" aplicado com sucesso!`;
        this.validandoCupom = false;
      },
      error: (err) => {
        this.cupomErro = true;
        this.cupomMensagem = err.error?.mensagem || 'Cupom inválido ou expirado.';
        this.validandoCupom = false;
        this.cupomAplicado = false;
        this.desconto = 0;
      }
    });
  }

  removerCupom(): void {
    this.codigoCupom = '';
    this.cupomAplicado = false;
    this.cupomMensagem = '';
    this.cupomErro = false;
    this.desconto = 0;
  }

  finalizarCompra(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    if (this.cartItems.length === 0) {
      this.errorMessage = 'Seu carrinho está vazio. Adicione produtos para prosseguir.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // 🛡️ SEGURANÇA 3 (CheckoutService): Sanitarização de Dados Confidenciais
    const dadosFormularioSeguro = this.checkoutService.sanitizePaymentData(this.checkoutForm.value);

    const produtos = this.cartItems.map(i => ({
      id_produto: i.product.id_produto,
      quantidade: i.quantity
    }));

    const metodo = dadosFormularioSeguro.metodo_pagamento;

    // Reaproveita a chave enquanto o pedido nao for concluido: um novo clique apos erro de rede
    // devolve o pedido ja criado em vez de duplicar a compra.
    this.checkoutIdempotencyKey ??= OrderService.newIdempotencyKey();

    this.orderService.createOrder(
      produtos,
      metodo,
      this.cupomAplicado ? this.codigoCupom.toUpperCase().trim() : undefined,
      this.checkoutIdempotencyKey,
      {
        estado: (this.checkoutForm.get('estado')?.value || '').trim().toUpperCase(),
        cidade: (this.checkoutForm.get('cidade')?.value || '').trim()
      }
    ).subscribe({
      next: () => {
        this.checkoutIdempotencyKey = null;
        this.isLoading = false;
        this.cartService.clearCart();
        this.router.navigate(['/perfil'], { queryParams: { tab: 'pedidos' } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.mensagem || 'Falha de segurança ou erro na comunicação. Tente novamente.';
      }
    });
  }
}