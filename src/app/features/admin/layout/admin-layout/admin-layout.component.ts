import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  isCollapsed = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Juntamos tudo na função logout() para bater com o seu HTML!
  logout() {
    console.log('Saindo do painel...');
    this.authService.logout(); // Limpa o token de segurança

    // --- A MÁGICA ANTI-TELA ESCURA ---
    // 1. Fecha o menu lateral por garantia
    this.isCollapsed = true; 
    
    // 2. Devolve o scroll e os cliques ao corpo da página
    document.body.style.overflow = 'auto';
    document.body.style.pointerEvents = 'auto';
    
    // 3. Remove classes de bloqueio que bibliotecas (como Bootstrap) possam ter deixado
    document.body.classList.remove('modal-open', 'offcanvas-open');
    
    // 4. Destrói fisicamente qualquer 'fundo escuro' órfão preso no HTML
    document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop, .modal, .overlay, .sidebar-overlay').forEach(el => el.remove());
    // ---------------------------------

    // Agora sim, redireciona em segurança!
    this.router.navigate(['/admin/login']);
  }
}