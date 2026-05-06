import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { AiChatComponent } from '../ai-chat/ai-chat.component';

@Component({
  selector: 'app-hover-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AiChatComponent],
  templateUrl: './hover-nav.component.html',
  styleUrl: './hover-nav.component.css'
})
export class HoverNavComponent implements OnInit {
  isLoggedIn: boolean = false;
  isChatOpen: boolean = false;
  displayName: string = 'Perfil';
  searchQuery: string = '';
  
  // Controle de qual menu está aberto ('search' ou 'profile' ou nenhum)
  openMenu: 'search' | 'profile' | null = null;
  
  // Controle de exibição dos botões de navegação
  viewProductsBtn: boolean = false;
  viewHomeBtn: boolean = false;

  constructor(public authService: AuthService, private router: Router) {
    // check rota inicial
    this.checkRoute(this.router.url);

    // Detecta mudanças de rotas para mudar o botão 1 (Home <-> Produtos)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects);
    });
  }

  // Método centralizado para aplicar a regra do hover-nav
  private checkRoute(url: string): void {
    // Reseta as flags
    this.viewProductsBtn = false;
    this.viewHomeBtn = false;

    const isHome = url === '/' || url === '/home';
    const isProductDetail = url.includes('/produtos/');
    const isProductList = url.includes('/produtos');
    const isCart = url.includes('/carrinho');
    const isCheckout = url.includes('/checkout');
    const isProfile = url.includes('/perfil');
    const isLogin = url.includes('/login');
    const isContact = url.includes('/contatos');

    if (isHome || isProductDetail || isCart || isCheckout) {
      this.viewProductsBtn = true;
    } else if (isProductList || isProfile || isLogin || isContact) {
      this.viewHomeBtn = true;
    }
  }

  ngOnInit(): void {
    // Lógica importada idêntica ao Header
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        const parts = user.nome.trim().split(' ');
        this.displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0];
      } else {
        this.displayName = 'Perfil';
      }
    });
  }

  // Alterna o menu específico
  // Alterado para aceitar apenas os valores corretos do tipo que você definiu
  toggleMenu(menu: 'search' | 'profile', event: Event) {
    // 1. Essencial: Bloqueia o clique para não vazar para o documento
    if (event) {
      event.stopPropagation();
    }

    // 2. Alterna o estado corretamente
    if (this.openMenu === menu) {
      this.openMenu = null; // Corrigido de '' para null
    } else {
      this.openMenu = menu; 
      this.isChatOpen = false; // Se abrir pesquisa/perfil, fecha o chat
    }
  }

  // Fecha qualquer menu se clicar em qualquer lugar fora dele
  // (Juntámos o seu closeMenu com o HostListener)
  @HostListener('document:click')
  closeMenu(): void {
    this.openMenu = null;
  }

  // Executa a busca
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/produtos'], { queryParams: { query: this.searchQuery } });
      this.openMenu = null; // Fecha o painel após pesquisar
    }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  // Faz logout da conta
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.openMenu = null;
  }
}