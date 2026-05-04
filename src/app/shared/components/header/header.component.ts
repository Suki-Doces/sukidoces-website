import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, ViewportScroller } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
// CORRIGIDO: removido 'import { query } from 'express'' — Express é backend,
// não pode ser importado no Angular. Isso quebraria o build em produção.

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  viewProductsLink: boolean = false;
  viewHomeLink: boolean = false;

  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  displayName: string = 'Conta';
  searchQuery: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private scrolller: ViewportScroller
  ) {
    // Check initial route
    this.checkRoute(router.url);

    // Listen to route changes
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        const parts = user.nome.trim().split(' ');
        this.displayName = parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1]}`
          : parts[0];
      } else {
        this.displayName = 'Conta';
      }
    });
  }

  private checkRoute(url: string): void {
    // Reseta as flags
    this.viewProductsLink = false;
    this.viewHomeLink = false;

    const isHome = url === '/' || url === '/home';
    const isProductDetail = url.includes('/produtos/');
    const isProductList = url.includes('/produtos');
    const isCart = url.includes('/carrinho');
    const isCheckout = url.includes('/checkout');
    const isProfile = url.includes('/perfil');
    const isLogin = url.includes('/login');

    // Regra de exibição
    if (isHome || isProductDetail || isCart || isCheckout) {
      this.viewProductsLink = true;
    } else if (isProductList || isProfile || isLogin) {
      this.viewHomeLink = true;
    } else {
      // Fallback de segurança (ex: página 404)
      this.viewHomeLink = true; 
    }
  }

  scrollToContacts() {
    this.scrolller.scrollToAnchor('ftr-contacts');
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/produtos'], { queryParams: { query: this.searchQuery } });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }
}
