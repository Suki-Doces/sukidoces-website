import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'; // O teu serviço já existente

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css']
})
export class LoginAdminComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variáveis para o formulário
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  fazerLoginAdmin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Reutilizamos a função de login que já tens no AuthService
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (resposta) => {
        this.isLoading = false;

        // Verifica se quem fez o login tem permissão de 'admin'
        // Assumindo que o teu serviço guarda o 'user' no localStorage ou devolve na resposta
        const utilizador = JSON.parse(localStorage.getItem('user') || '{}');

        if (utilizador.role === 'admin') {
          // Login bem-sucedido e é admin: Vai para o Dashboard!
          this.router.navigate(['/admin/dashboard']);
        } else {
          // Não é admin: Limpa o token e mostra erro
          this.authService.logout();
          this.errorMessage = 'Acesso negado: Apenas administradores podem entrar aqui.';
        }
      },
      error: (erro) => {
        this.isLoading = false;
        this.errorMessage = 'E-mail ou palavra-passe incorretos.';
        console.error('Erro no login admin:', erro);
      }
    });
  }
}
