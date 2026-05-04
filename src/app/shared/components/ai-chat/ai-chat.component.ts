import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/gemini.service'; // Ajuste o caminho se necessário

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importante para o *ngFor e [(ngModel)]
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent {
  @Output() closeChat = new EventEmitter<void>(); // Evento para fechar a janela

  // 2. Captura a div que marcámos com #scrollMe no HTML
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  mensagemUsuario: string = '';
  historico: { role: string, text: string }[] = [];
  carregando: boolean = false;

  constructor(private chatService: ChatService) { }

  enviarMensagem() {
    if (!this.mensagemUsuario.trim()) return;

    // 1. Adiciona a mensagem do cliente na interface
    this.historico.push({ role: 'user', text: this.mensagemUsuario });
    const mensagemGuardada = this.mensagemUsuario;
    this.mensagemUsuario = '';
    this.carregando = true;

    this.scrollToBottom();

    // 2. Chama a API do Backend
    this.chatService.enviarMensagem(mensagemGuardada).subscribe({
      next: (res) => {
        // 3. Adiciona a resposta do Bot na interface e no serviço
        this.historico.push({ role: 'bot', text: res.response });
        this.chatService.adicionarRespostaBotAoHistorico(res.response);
        this.carregando = false;

        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);
        this.historico.push({ role: 'bot', text: 'Desculpe, não consigo te responder agora. Tente novamente mais tarde.' });
        this.carregando = false;

        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    // Usamos um setTimeout muito rápido para dar tempo ao Angular 
    // de desenhar a nova mensagem no HTML antes de calcular a altura
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