import { Component, EventEmitter, Output, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Ajuste os caminhos de importação conforme seu projeto
import { ChatService, ChatMessage } from '../../../core/services/gemini.service';
import { LinkFormatPipe } from '../../pipes/link-format.pipe';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, LinkFormatPipe],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements OnInit {
  @Output() closeChat = new EventEmitter<void>();

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  mensagemUsuario: string = '';
  // Utilizamos a interface do Serviço para tipar o histórico
  historico: ChatMessage[] = [];
  carregando: boolean = false;

  constructor(
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Assim que o chat abrir (ou ao trocar de tela), puxamos o histórico salvo na sessão
    this.historico = this.chatService.getHistoricoDisplay();
    this.scrollToBottom();
  }

  enviarMensagem() {
    if (!this.mensagemUsuario.trim()) return;

    const textoEnviado = this.mensagemUsuario;
    this.mensagemUsuario = '';
    this.carregando = true;

    // 2. Chama a API do Backend. O Serviço JÁ salva a mensagem do usuário no histórico!
    this.chatService.enviarMensagem(textoEnviado).subscribe({
      next: (res) => {
        // 3. Salva a resposta do bot na memória oficial do Serviço
        this.chatService.adicionarRespostaBotAoHistorico(res.response);

        // 4. Atualiza a tela pegando o histórico atualizado
        this.historico = this.chatService.getHistoricoDisplay();
        this.carregando = false;

        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);
        // Em caso de erro, simulamos uma resposta do bot salvando na memória oficial
        this.chatService.adicionarRespostaBotAoHistorico('Desculpe, não consigo te responder agora. Tente novamente mais tarde.');

        this.historico = this.chatService.getHistoricoDisplay();
        this.carregando = false;

        this.scrollToBottom();
      }
    });

    // Atualiza a tela IMEDIATAMENTE antes da API responder, para o usuário já ver sua própria mensagem na tela
    this.historico = this.chatService.getHistoricoDisplay();
    this.scrollToBottom();
  }

  @HostListener('click', ['$event'])
  onChatLinkClick(event: Event): void {
    const target = event.target as HTMLElement;

    // 1. Procurar a tag <a> mais próxima (corrige o problema de clicar no <strong>)
    const link = target.closest('a.chat-product-link');

    if (link) {
      event.preventDefault(); // Bloqueia a navegação falha do navegador nativo

      let href = link.getAttribute('href');
      if (href) {

        // Se por acaso o SukiBot devolver um link externo (como Google ou YouTube), abre num novo separador
        if (href.startsWith('http')) {
          window.open(href, '_blank');
          return;
        }

        // 2. Garantir que a rota é interpretada como absoluta a partir da raiz pelo Angular
        if (!href.startsWith('/')) {
          href = '/' + href;
        }

        // Navegar suavemente usando o Router interno do Angular
        this.router.navigateByUrl(href).then(() => {
          // this.fechar(); // Descomente esta linha caso queira que o chat feche ao abrir a página do produto
        });
      }
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }, 50);
  }

  fechar() {
    this.closeChat.emit();
  }
}
