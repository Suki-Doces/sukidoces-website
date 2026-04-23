import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importante para o *ngIf

import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HoverNavComponent } from './shared/components/hover-nav/hover-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, HoverNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sukidoces-website';
  isAdminRoute = false;

  constructor(private router: Router) {
    // Fica escutando as mudanças de rota
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Se a URL atual tem '/admin', a variável vira true
        this.isAdminRoute = event.urlAfterRedirects.includes('/admin');
      }
    });
  }
}