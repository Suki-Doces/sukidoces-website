import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';

// Services
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service'; // <-- Importado

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
export class LoginComponent {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  formData = {
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmar_senha: '',
  };

  // <-- CartService Injetado no construtor
  constructor(
    private authService: AuthService, 
    private router: Router,
    private cartService: CartService 
  ) { }

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
          if(this.authService.isLoggedIn()) {
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