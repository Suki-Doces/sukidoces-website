import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ChildrenOutletContexts } from '@angular/router';
import { glassRouteAnimation } from './route-animations';
import { CommonModule } from '@angular/common'; // Importante para o *ngIf

import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HoverNavComponent } from './shared/components/hover-nav/hover-nav.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AiChatComponent } from './shared/components/ai-chat/ai-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, HoverNavComponent, ToastComponent, AiChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [glassRouteAnimation]
})
export class AppComponent implements OnInit {
  title = 'SukiDoces';
  isAdminRoute = false;
  isDesktopChatOpen = false;

  // --- NOVAS VARIÁVEIS PARA A ANIMAÇÃO DO BOTÃO ---
  isChatButtonExpanded = false;
  chatPhrase = '';
  phrases = [
    'O que eu posso te ajudar?',
    'Posso consultar produtos para você',
    'Listarei produtos seguindo o seu orçamento',
    'Encontrarei o doce perfeito para você!',
    'Que tipo de produto você procura?',
    'Precisando? É só chamar o Suki aqui!',
    'Estou aqui para ajudar com o que precisar :)',
    'Necessário fazer o login para fazer pedidos!',
  ];

  constructor(private router: Router, private contexts: ChildrenOutletContexts) {
    // Fica escutando as mudanças de rota
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Se a URL atual tem '/admin', a variável vira true
        this.isAdminRoute = event.urlAfterRedirects.includes('/admin');
      }
    });

  }

  ngOnInit() {
    // Escolhe uma frase aleatória
    this.chatPhrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];

    // Atrasa 1.5s para disparar a animação de expansão depois da página carregar
    setTimeout(() => {
      this.isChatButtonExpanded = true;

      // Esconde a frase depois de 6 segundos voltando ao botão normal
      setTimeout(() => {
        this.isChatButtonExpanded = false;
      }, 6000);
    }, 1500);
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  toggleDesktopChat() {
    this.isDesktopChatOpen = !this.isDesktopChatOpen;

    // Se o usuário clicar enquanto estiver expandido, recolhe o botão imediatamente
    if (this.isDesktopChatOpen) {
      this.isChatButtonExpanded = false;
    }
  }
}