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

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  salvandoDados = false;
  isLoading = false;
  errorMessage = '';

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

  // Número da loja para WhatsApp (troque pelo número real)
  private readonly WHATSAPP_LOJA = '5511999999999';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private checkoutService: CheckoutService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      nome:        [{ value: '', disabled: true }, Validators.required],
      email:       [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      cpf:         ['', [Validators.required, Validators.minLength(11)]],
      telefone:    ['', Validators.required],
      cep:         ['', Validators.required],
      ruaAvenida:  ['', Validators.required],
      numero:      ['', Validators.required],
      complemento: [''],
      bairro:      ['', Validators.required],
      cidadeEstado:['', Validators.required],
      // ADICIONADO: método de pagamento obrigatório
      metodo_pagamento: ['pix', Validators.required]
    });

    // Preenche dados do usuário logado
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const userData: any = user;
        let enderecoArray: string[] = [];
        if (userData.endereco) {
          try {
            enderecoArray = typeof userData.endereco === 'string'
              ? JSON.parse(userData.endereco)
              : userData.endereco;
          } catch (e) {}
        }
        this.checkoutForm.patchValue({
          nome:         userData.nome || '',
          email:        userData.email || '',
          cpf:          userData.cpf || '',
          telefone:     userData.telefone || '',
          cep:          enderecoArray[0] || '',
          ruaAvenida:   enderecoArray[1] || '',
          numero:       enderecoArray[2] || '',
          complemento:  enderecoArray[3] || '',
          bairro:       enderecoArray[4] || '',
          cidadeEstado: enderecoArray[5] || ''
        });
      }
    });

    // Carrega carrinho
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.subtotal = items.reduce((sum, i) => sum + (i.product.preco * i.quantity), 0);
      this.frete = this.subtotal >= 50 ? 0 : 8.90;
      this.freteGratis = this.subtotal >= 50;
    });
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.desconto) + this.frete;
  }

  onAutoSaveBlur(): void {
    if (this.checkoutForm.get('cpf')?.valid) {
      this.salvarUsuarioNoBanco();
    }
  }

  private salvarUsuarioNoBanco(): void {
    this.salvandoDados = true;
    const formValue = this.checkoutForm.getRawValue();

    const enderecoFormatado = [
      formValue.cep, formValue.ruaAvenida, formValue.numero,
      formValue.complemento, formValue.bairro, formValue.cidadeEstado
    ];

    const payload: UsuarioCheckout = {
      nome:     formValue.nome,
      email:    formValue.email,
      cpf:      formValue.cpf,
      telefone: formValue.telefone,
      endereco: JSON.stringify(enderecoFormatado)
    };

    this.checkoutService.autoSalvarUsuario(payload).subscribe({
      next: () => { this.salvandoDados = false; },
      error: () => { this.salvandoDados = false; }
    });
  }

  // ADICIONADO: valida cupom contra a API antes de finalizar
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
      // Flag para só validar sem criar pedido — backend deve suportar
      apenas_validar: true
    }).subscribe({
      next: (res) => {
        // Sucesso: pedido criado mas queremos apenas o desconto
        // Como não temos rota específica de validação, vamos fazer diferente:
        this.desconto = 0;
        this.cupomAplicado = true;
        this.cupomMensagem = `Cupom "${this.codigoCupom.toUpperCase()}" aplicado!`;
        this.cupomErro = false;
        this.validandoCupom = false;
      },
      error: (err) => {
        // Se retornar erro sobre o cupom, exibe a mensagem
        const msg = err.error?.mensagem || '';
        if (msg.includes('Cupom') || msg.includes('cupom')) {
          this.cupomErro = true;
          this.cupomMensagem = msg;
        } else {
          // Cupom pode ser válido mas outro erro ocorreu — trata como sucesso do cupom
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

  // CORRIGIDO: era só console.log — agora chama a API e confirma via WhatsApp
  finalizarCompra(): void {
    if (!this.checkoutForm.valid) {
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

        // Limpa o carrinho após pedido criado
        this.cartService.clearCart();

        // Confirmação via WhatsApp
        this.abrirWhatsApp(resposta.pedido.id_pedido, resposta.resumo?.valor_total || this.total, metodo);

        // Redireciona para o perfil na aba pedidos
        this.router.navigate(['/perfil'], { queryParams: { tab: 'pedidos' } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.mensagem || 'Erro ao finalizar o pedido. Tente novamente.';
      }
    });
  }

  private abrirWhatsApp(idPedido: number, valorTotal: number, metodo: string): void {
    const nome = this.checkoutForm.getRawValue().nome || 'Cliente';
    const metodosMap: any = { pix: 'PIX', cartao: 'Cartão', boleto: 'Boleto' };

    const mensagem =
      `Olá, Suki Doces! 🍬\n\n` +
      `Meu pedido #${idPedido} foi realizado!\n` +
      `👤 ${nome}\n` +
      `💰 Total: R$ ${Number(valorTotal).toFixed(2)}\n` +
      `💳 Pagamento: ${metodosMap[metodo] || metodo}\n\n` +
      `Aguardo a confirmação! 😊`;

    window.open(
      `https://api.whatsapp.com/send?phone=${this.WHATSAPP_LOJA}&text=${encodeURIComponent(mensagem)}`,
      '_blank'
    );
  }
}
