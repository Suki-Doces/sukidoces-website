import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-hover-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './hover-nav.component.html',
  styleUrl: './hover-nav.component.css'
})
export class HoverNavComponent implements OnInit {
  isLoggedIn: boolean = false;
  displayName: string = 'Perfil';
  searchQuery: string = '';
  
  // Controle de qual menu está aberto ('search' ou 'profile' ou nenhum)
  openMenu: 'search' | 'profile' | null = null;
  
  // Controle de exibição dos botões de navegação
  viewProductsBtn: boolean = false;
  viewHomeBtn: boolean = false;

  constructor(public authService: AuthService, private router: Router) {
    // check rota inital
    this.checkRoute(this.router.url);

    // Detect mudanças de rotas para mudar o botão 1 (Home <-> Produtos)
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

    if (isHome || isProductDetail || isCart || isCheckout) {
      this.viewProductsBtn = true;
    } else if (isProductList || isProfile) {
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
  toggleMenu(menu: 'search' | 'profile', event: Event): void {
    event.stopPropagation();
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  // Fecha o menu se clicar em qualquer lugar fora dele
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

  // Faz logout da conta
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.openMenu = null;
  }
}