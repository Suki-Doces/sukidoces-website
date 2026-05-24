import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { ProductService } from 'src/app/core/services/product.service';

// Services
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxMaskDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  isTransitioning = false;
  errorMessage = '';


  formData = {
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmar_senha: '',
  };

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  produtos: any[] = [];
  produtosExibidos: any[] = [];
  private intervalId: any;

  // <-- CartService Injetado no construtor
  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.productService.getProducts().subscribe((res: any[]) => {
      // 1. Ordena os produtos pelo ID para garantir que os últimos sejam os mais recentes
      const produtosOrdenados = [...res].sort((a, b) => a.id_produto - b.id_produto);
      const total = produtosOrdenados.length;

      // 2. Mapeia os produtos definindo a tag
      this.produtos = produtosOrdenados.map(p => {
        // Define se é um dos 5 últimos (índice maior ou igual ao total - 5)
        const ehNovo = produtosOrdenados.indexOf(p) >= (total - 5);

        return {
          ...p,
          imagemUrl: (p.imagem && p.imagem.startsWith('http'))
            ? p.imagem
            : this.defaultImage,
          tag: ehNovo ? 'Novo' : 'Destaque'
        };
      });

      this.trocarProdutos();
      this.iniciarCarrossel();
    });
  }

  iniciarCarrossel(): void {
    this.intervalId = setInterval(() => {
      this.trocarProdutos();
    }, 10000);
  }

  trocarProdutos(): void {
    this.isTransitioning = true; // Inicia o fade-out (CSS via .fading)

    setTimeout(() => {
      let disponiveis = this.produtos.filter(p =>
        !this.produtosExibidos.some(exibido => exibido.id_produto === p.id_produto)
      );
      if (disponiveis.length < 5) disponiveis = this.produtos;

      this.produtosExibidos = disponiveis
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      this.isTransitioning = false; // Finaliza o fade-in
    }, 1000);
  }

  // Lógica de Imagem (Reutilizada do catálogo)
  getProductImage(imageURL: string | null): string {
    if (!imageURL) return this.defaultImage;
    if (imageURL.startsWith('http')) return imageURL;
    return this.defaultImage;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  trackByFn(index: number, item: any): number {
    return item.id;
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.formData.senha = '';
    this.formData.confirmar_senha = '';
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.isLoginMode && this.formData.senha !== this.formData.confirmar_senha) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.isLoading = true;

    if (this.isLoginMode) {
      // ====== Lógica de Login ======
      this.authService.login({ email: this.formData.email, senha: this.formData.senha }).subscribe({
        next: () => {

          // -----> SINCRONIZA O CARRINHO AQUI <-----
          this.cartService.syncGuestCartToDatabase();

          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']); // Sucesso
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'E-mail ou senha incorretos.';
          this.isLoading = false;
        }
      });

    } else {
      // ====== Lógica de Cadastro ======
      const novoUsuario = {
        nome: this.formData.nome,
        telefone: this.formData.telefone,
        email: this.formData.email,
        senha: this.formData.senha
      };

      this.authService.registro(novoUsuario).subscribe({
        next: () => {
          // Caso o registro também já deixe o usuário logado automaticamente, sincronizamos aqui também
          if (this.authService.isLoggedIn()) {
            this.cartService.syncGuestCartToDatabase();
          }
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'E-mail já cadastrado. Faça o login ou use outro e-mail.';
          this.isLoading = false;
        }
      });
    }
  }
}