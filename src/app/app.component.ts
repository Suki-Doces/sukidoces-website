import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ChildrenOutletContexts } from '@angular/router';
import { glassRouteAnimation } from './route-animations';
import { CommonModule } from '@angular/common'; // Importante para o *ngIf

import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HoverNavComponent } from './shared/components/hover-nav/hover-nav.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, HoverNavComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [glassRouteAnimation]
})
export class AppComponent {
  title = 'SukiDoces';
  isAdminRoute = false;

  constructor(private router: Router, private contexts: ChildrenOutletContexts) {
    // Fica escutando as mudanças de rota
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Se a URL atual tem '/admin', a variável vira true
        this.isAdminRoute = event.urlAfterRedirects.includes('/admin');
      }
    });
    
  }
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}