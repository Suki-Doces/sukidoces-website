import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

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

    // CORRIGIDO: usar loginAdmin() que aponta para /admin/login
    // A rota /admin/login aceita credenciais de administradores
    this.authService.loginAdmin({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;

        // CORRIGIDO: era localStorage.getItem('user') — chave errada!
        // AuthService salva em 'suki_user', não em 'user'
        const utilizador = JSON.parse(localStorage.getItem('suki_user') || '{}');

        // CORRIGIDO: era utilizador.role — o backend retorna 'nivel', não 'role'
        if (utilizador.nivel === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.authService.logout();
          this.errorMessage = 'Acesso negado: Apenas administradores podem entrar aqui.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'E-mail ou palavra-passe incorretos.';
      }
    });
  }
}
