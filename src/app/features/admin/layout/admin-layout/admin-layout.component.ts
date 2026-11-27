import { Component, inject, OnInit } from '@angular/core';

import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';
import { AdminIconComponent } from '../../../../shared/components/admin-icon/admin-icon.component';

@Component({
    selector: 'app-admin-layout',
    imports: [RouterModule, AdminIconComponent],
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

  // Largura (px) até a qual a sidebar começa recolhida e vira menu sobreposto
  private readonly mobileBreakpoint = 768;

  ngOnInit(): void {
    // No mobile o menu começa recolhido para não cobrir o conteúdo
    this.isCollapsed = this.isMobileViewport();

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

  // Iniciais exibidas no avatar quando o admin não tem foto (ex.: "Administrador" -> "AD")
  get iniciaisAdmin(): string {
    const partes = (this.nomeAdmin || 'Admin').trim().split(/\s+/);
    const iniciais = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2);
    return iniciais.toUpperCase();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Após navegar no mobile, recolhe o menu para liberar a tela
  onNavigate(): void {
    if (this.isMobileViewport()) {
      this.isCollapsed = true;
    }
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= this.mobileBreakpoint;
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
