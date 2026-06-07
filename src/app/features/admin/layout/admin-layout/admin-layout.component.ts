import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  isCollapsed = false;

  // NOVO: variáveis para a foto e o nome do admin
  fotoAdminUrl: string | null = null;
  nomeAdmin: string = 'Admin';

  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient); // NOVO: injeta o HttpClient

  // NOVO: busca a foto assim que o layout carrega
  ngOnInit(): void {
    // Escuta o usuário logado via AuthService
    this.authService.currentUser$.subscribe(user => {
      if (!user?.id) return;

      // Preenche o nome imediatamente com o que já está no token
      this.nomeAdmin = user.nome || 'Admin';

      // Busca os dados completos do admin no backend (incluindo foto_perfil)
      this.http.get<any>(`${environment.apiUrl}/admin/configuracoes/${user.id}`)
        .subscribe({
          next: (dados) => {
            // Se o admin tiver foto salva, usa ela — senão mantém o ícone padrão
            if (dados?.foto_perfil) {
              this.fotoAdminUrl = dados.foto_perfil;
            }
            // Atualiza o nome com o que veio do banco (mais atualizado)
            if (dados?.nome) {
              this.nomeAdmin = dados.nome;
            }
          },
          error: () => {
            // Se a busca falhar (ex: backend offline), mantém a foto padrão
            // O painel continua funcionando normalmente
          }
        });
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.authService.logout();

    this.isCollapsed = true;
    document.body.style.overflow = 'auto';
    document.body.style.pointerEvents = 'auto';
    document.body.classList.remove('modal-open', 'offcanvas-open');
    document.querySelectorAll(
      '.modal-backdrop, .offcanvas-backdrop, .modal, .overlay, .sidebar-overlay'
    ).forEach(el => el.remove());

    this.router.navigate(['/admin/login']);
  }
}
