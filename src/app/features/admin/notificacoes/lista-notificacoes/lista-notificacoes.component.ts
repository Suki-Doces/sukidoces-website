import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// O "molde" de como uma notificação deve ser
interface Notificacao {
  id: number;
  mensagem: string;
  tempo: string;
  icone: string;
  lida: boolean;
}

@Component({
  selector: 'app-lista-notificacoes',
  standalone: true,
  imports: [CommonModule], // <--- 2. O SEGREDO ESTÁ AQUI! Coloque o CommonModule aqui dentro
  templateUrl: './lista-notificacoes.component.html',
  styleUrls: ['./lista-notificacoes.component.css']
})

export class ListaNotificacoesComponent implements OnInit {
  private http = inject(HttpClient);
  
  // A nossa lista inteligente
  notificacoes: Notificacao[] = [];

  ngOnInit() {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    // Tenta buscar da sua API real
    this.http.get<Notificacao[]>('http://localhost:3000/suki-doces/notificacoes').subscribe({
      next: (dados) => {
        this.notificacoes = dados;
      },
      error: (erro) => {
        console.log('API de notificações não encontrada, usando dados de teste.');
        // PLANO B: Dados falsos para você ver a tela funcionando na hora!
        this.notificacoes = [
          { id: 1, mensagem: 'O Cliente Ruben Amorin usou o cupom de 20% na sua compra.', tempo: '1m ago', icone: 'assets/icon/Cupom - icon.svg', lida: false },
          { id: 2, mensagem: 'Nova compra realizada número do Pedido #00399', tempo: '5m ago', icone: 'assets/icon/Payment - icon.svg', lida: false },
          { id: 3, mensagem: 'Acabou o estoque do produto Minalba 250ml', tempo: '1h ago', icone: 'assets/icon/Storage - icon.svg', lida: true },
          { id: 4, mensagem: 'Novo cadastro! Larissa Almeida criou uma conta.', tempo: '2h ago', icone: 'assets/icon/User - icon.svg', lida: true }
        ];
      }
    });
  }

  // Ação do botão "Marcar como lidas"
  marcarTodasComoLidas() {
    this.notificacoes.forEach(n => n.lida = true);
    // FUTURO: Aqui você enviará um PUT para o Node.js avisando o banco de dados
  }

  // Ação do botão "X" de fechar
  fecharNotificacao(id: number) {
    // Filtra a lista, removendo a notificação que foi clicada
    this.notificacoes = this.notificacoes.filter(n => n.id !== id);
    // FUTURO: Aqui você enviará um DELETE para o Node.js apagar do banco
  }
}
