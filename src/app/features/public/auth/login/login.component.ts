import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Services
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Controla qual formulario está visivel (login ou cadastro)
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  // Objeto para armazenar as credenciais do usuário em tempo real
  formData = {
    nome: '',
    email: '',
    senha: '',
    confirmar_senha: '',
  };

  constructor(private authService: AuthService, private router: Router) { }

  // Alterna entre os modos de login e cadastro
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    // Limpa as senhas por segurança
    this.formData.senha = '';
    this.formData.confirmar_senha = '';
  }

  onSubmit() {
    this.errorMessage = '';

    // Validação extra para o modo de cadastro
    if (!this.isLoginMode && this.formData.senha !== this.formData.confirmar_senha) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.isLoading = true;

    if (this.isLoginMode) {
      // ====== Logica de Login ======
      this.authService.login({ email: this.formData.email, senha: this.formData.senha }).subscribe({
        next: () => {
          this.router.navigate(['/']); // Sucesso, redireciona para a página inicial
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'E-mail ou senha incorretos.';
          this.isLoading = false;
        }
      });
    } else {
      // ====== Logica de Cadastro ======
      const novoUsuario = {
        nome: this.formData.nome,
        email: this.formData.email,
        senha: this.formData.senha
      };

      this.authService.registro(novoUsuario).subscribe({
        next: () => {
          this.router.navigate(['/']); // Sucesso, redireciona para a página inicial
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'E-mail já cadastrado. Faça o login ou use outro e-mail.';
          this.isLoading = false;
        }
      });
    }
  }
}
