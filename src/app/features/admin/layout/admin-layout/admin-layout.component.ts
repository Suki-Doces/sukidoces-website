import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  isCollapsed = false;

  fotoAdminUrl: string | null = null;
  nomeAdmin: string = 'Admin';

  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  ngOnInit(): void {
    // Escuta o usuário logado inicialmente
    this.authService.currentUser$.subscribe(user => {
      if (!user?.id) return;
      this.nomeAdmin = user.nome || 'Admin';
      this.carregarDadosAdmin();
    });

    // Sempre que o administrador navegar entre as páginas, recarrega os dados
    // Isso resolve o problema da foto não atualizar na hora após salvar as configurações!
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.carregarDadosAdmin();
    });
  }

  carregarDadosAdmin(): void {
    // URL Corrigida: Retirado o ID, pois o backend puxa o administrador direto pelo Token seguro
    this.http.get<any>(`${environment.apiUrl}/admin/configuracoes`)
      .subscribe({
        next: (dados) => {
          if (dados?.foto_perfil) {
            this.fotoAdminUrl = dados.foto_perfil;
          } else {
            this.fotoAdminUrl = null;
          }
          if (dados?.nome) {
            this.nomeAdmin = dados.nome;
          }
        },
        error: (err) => {
          console.error('Erro ao buscar dados atualizados do admin:', err);
        }
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
