import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { OrderService } from 'src/app/core/services/order.service';
import { CheckoutService, UsuarioCheckout } from 'src/app/core/services/checkout.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgxMaskDirective } from 'ngx-mask';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  salvandoDados = false;
  isLoading = false;
  errorMessage = '';
  user: any;

  // Controle de Telas (1: Endereço, 2: Pagamento)
  currentStep: number = 1;

  // Carrinho
  cartItems: any[] = [];
  subtotal = 0;
  frete = 0;
  freteGratis = false;

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
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private checkoutService: CheckoutService,
    private userService: UserService,
    private http: HttpClient
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
      metodo_pagamento: ['pix', Validators.required]
    });

    this.isLoading = true;

    // 2. Busca na base de dados
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        const userData = res.user || res;

        this.user = userData; // <--- ADICIONE ESTA LINHA AQUI

        // DICA DE DEBUG: Verifique a aba Console (F12) para ver exatamente o que a API enviou
        console.log('📦 Dados recebidos da API no Checkout:', userData);

        if (userData) {
          let cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = '';

          // LÓGICA À PROVA DE BALAS: Pega o campo, independentemente de vir no singular ou plural
          const enderecoBruto = userData.endereco || userData.enderecos;

          if (enderecoBruto) {
            try {
              // Se vier como String (JSON), faz o parse. Se o backend já devolveu como Array, usa direto.
              const addrArray = typeof enderecoBruto === 'string' ? JSON.parse(enderecoBruto) : enderecoBruto;

              if (Array.isArray(addrArray)) {

                // CASO A: Novo padrão (Array de Strings: ["cep", "rua", "numero", ...])
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
                }
                // CASO B: Formato legado (Array de Objetos: [{ cep: "...", logradouro: "..." }])
                else if (addrArray.length > 0 && addrArray[0].cep) {
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
              console.error('❌ Erro no parse do endereço (Dados corrompidos no banco?):', e);
            }
          }

          // Injeta os dados no formulário visual
          this.checkoutForm.patchValue({
            nome: userData.nome || '',
            email: userData.email || '',
            cpf: userData.cpf || '',
            telefone: userData.telefone || '',
            cep, rua, numero, complemento, bairro, cidade, estado
          });

          // Se estiver tudo preenchido corretamente, pula a Step 1 e vai para o Pagamento
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

  // Verifica se o utilizador já tem perfil com dados completos 
  private isDadosCompletos(): boolean {
    const raw = this.checkoutForm.getRawValue();
    // Usa o ?.trim() para garantir que uma string com espaços em branco não conte como "preenchido"
    return !!(
      raw.cpf?.trim() &&
      raw.telefone?.trim() &&
      raw.cep?.trim() &&
      raw.rua?.trim() &&
      raw.numero?.trim() &&
      raw.bairro?.trim() &&
      raw.cidade?.trim() &&
      raw.estado?.trim()
    );
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.desconto) + this.frete;
  }

  // Calcula o frete de acordo com o Estado
  calcularFrete(): void {
    const estado = this.checkoutForm.get('estado')?.value?.toUpperCase();

    if (this.subtotal >= 50) {
      this.frete = 0; // Frete Grátis acima de R$50
    } else {
      // Exemplo de taxa por local: SP = 8.90, Outros = 15.90
      this.frete = (estado === 'SP') ? 8.90 : 15.90;
    }
    this.freteGratis = this.frete === 0;
  }

  // Busca o CEP via API (mesmo do perfil)
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
              this.calcularFrete(); // Recalcula o frete se mudar o estado
            }
          }
        });
      }
    }
  }

  // Transição do Step 1 para o Step 2
  async prosseguirParaPagamento(): Promise<void> {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Usa a variável de loading existente para travar a tela

    try {
      // Aguarda a resposta do banco de dados antes de continuar
      await this.salvarUsuarioNoBanco();

      this.calcularFrete();
      this.currentStep = 2; // Só passa para a tela 2 se salvar com sucesso
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Erro no checkout:', error);
      this.errorMessage = 'Ocorreu um erro ao salvar o endereço. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  voltarParaEndereco(): void {
    this.currentStep = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Atualizado para usar o mesmo formato e serviço do Perfil
  // Atualizado para enviar o formato de RELAÇÃO que o Prisma exige
  private salvarUsuarioNoBanco(): Promise<any> {
    const formValue = this.checkoutForm.getRawValue();

    // 1. Verifique se o usuário já tem um endereço cadastrado. 
    // Precisamos do ID desse endereço para o Prisma atualizar.
    const idEnderecoAtual = this.user?.id_endereco_atual || this.user?.enderecos?.[0]?.id_endereco;

    // 2. Se houver um ID, montamos o objeto no padrão "update" do Prisma.
    // Se NÃO houver um ID, o usuário é novo e precisa do padrão "create".
    let enderecosPayload: any = {};

    if (idEnderecoAtual) {
      enderecosPayload = {
        update: {
          where: { id_endereco: idEnderecoAtual },
          data: {
            cep: formValue.cep,
            logradouro: formValue.rua,
            numero: formValue.numero,
            complemento: formValue.complemento,
            bairro: formValue.bairro,
            cidade: formValue.cidade, // <--- CORRIGIDO
            estado: formValue.estado  // <--- CORRIGIDO
          }
        }
      };
    } else {
      enderecosPayload = {
        create: {
          cep: formValue.cep,
          logradouro: formValue.rua,
          numero: formValue.numero,
          complemento: formValue.complemento,
          cidade: formValue.cidade, // <--- CORRIGIDO
          estado: formValue.estado  // <--- CORRIGIDO
        }
      };
    }

    // 3. Monta o payload final
    const dadosParaAtualizar = {
      nome: formValue.nome,
      telefone: formValue.telefone,
      cpf: formValue.cpf,
      // Passa o objeto estruturado em vez do Array plano
      enderecos: enderecosPayload
    };

    // 4. Retorna a Promise
    return new Promise((resolve, reject) => {
      this.userService.updateProfile(dadosParaAtualizar).subscribe({
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

    const produtos = this.cartItems.map(i => ({
      id_produto: i.product.id_produto,
      quantidade: i.quantity
    }));

    this.http.post<any>(`${environment.apiUrl}/pedidos`, {
      produtos,
      metodo_pagamento: this.checkoutForm.get('metodo_pagamento')?.value || 'pix',
      codigo_cupom: this.codigoCupom.toUpperCase().trim(),
      apenas_validar: true
    }).subscribe({
      next: (res) => {
        this.desconto = 0;
        this.cupomAplicado = true;
        this.cupomMensagem = `Cupom "${this.codigoCupom.toUpperCase()}" aplicado!`;
        this.cupomErro = false;
        this.validandoCupom = false;
      },
      error: (err) => {
        const msg = err.error?.mensagem || '';
        if (msg.includes('Cupom') || msg.includes('cupom')) {
          this.cupomErro = true;
          this.cupomMensagem = msg;
        } else {
          this.cupomAplicado = true;
          this.cupomMensagem = `Cupom "${this.codigoCupom.toUpperCase()}" será aplicado no pedido!`;
        }
        this.validandoCupom = false;
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
      this.errorMessage = 'Seu carrinho está vazio.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const produtos = this.cartItems.map(i => ({
      id_produto: i.product.id_produto,
      quantidade: i.quantity
    }));

    const metodo = this.checkoutForm.get('metodo_pagamento')?.value;

    this.orderService.createOrder(
      produtos,
      metodo,
      this.cupomAplicado ? this.codigoCupom.toUpperCase().trim() : undefined
    ).subscribe({
      next: (resposta) => {
        this.isLoading = false;
        this.cartService.clearCart();
        this.router.navigate(['/perfil'], { queryParams: { tab: 'pedidos' } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.mensagem || 'Erro ao finalizar o pedido. Tente novamente.';
      }
    });
  }
}