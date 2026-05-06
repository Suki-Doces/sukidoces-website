import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environments';

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
  imports: [CommonModule],
  templateUrl: './lista-notificacoes.component.html',
  styleUrls: ['./lista-notificacoes.component.css']
})
export class ListaNotificacoesComponent implements OnInit {
  private http = inject(HttpClient);
  
  notificacoes: Notificacao[] = [];

  private apiUrl = `${environment.apiUrl}/admin/notificacoes`;

  ngOnInit() {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    // Usamos <any> porque a API devolve um objeto: { notifications: [...], unreadCount: X }
    this.http.get<any>(this.apiUrl).subscribe({
      next: (dados) => {
        // "Traduzimos" os dados do Prisma para o formato que o seu HTML do Angular espera
        this.notificacoes = dados.notifications.map((n: any) => {
          return {
            id: n.id_notificacao,
            mensagem: n.mensagem,
            tempo: new Date(n.data_criacao).toLocaleDateString('pt-BR'), // Ex: 04/05/2026
            icone: this.getIconePorTipo(n.tipo),
            lida: n.lido
          };
        });
      },
      error: (erro) => {
        console.log('API de notificações não encontrada, usando dados de teste.', erro);
        // PLANO B (Fallback)
        this.notificacoes = [
          { id: 1, mensagem: 'O Cliente Ruben Amorin usou o cupom de 20% na sua compra.', tempo: '1m ago', icone: 'assets/icon/Cupom - icon.svg', lida: false },
          { id: 2, mensagem: 'Nova compra realizada número do Pedido #00399', tempo: '5m ago', icone: 'assets/icon/Payment - icon.svg', lida: false },
          { id: 3, mensagem: 'Acabou o estoque do produto Minalba 250ml', tempo: '1h ago', icone: 'assets/icon/Storage - icon.svg', lida: true },
          { id: 4, mensagem: 'Novo cadastro! Larissa Almeida criou uma conta.', tempo: '2h ago', icone: 'assets/icon/User - icon.svg', lida: true }
        ];
      }
    });
  }

  // Função auxiliar para escolher o ícone baseado no tipo de notificação
  getIconePorTipo(tipo: string): string {
    switch(tipo) {
      case 'usuario': return 'assets/admin/icon/User - icon.svg';
      case 'pedido': return 'assets/admin/icon/Payment - icon.svg';
      case 'carrinho': return 'assets/admin/icon/Cart - icon.svg';
      default: return 'assets/admin/icon/Notification - icon.svg';
    }
  }

  // AGORA FUNCIONA DE VERDADE COM O BACKEND!
  marcarTodasComoLidas() {
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        // Se a API confirmar, atualizamos a tela
        this.notificacoes.forEach(n => n.lida = true);
      },
      error: (err) => console.error('Erro ao marcar como lidas na API', err)
    });
  }

  // AGORA FUNCIONA DE VERDADE COM O BACKEND!
  fecharNotificacao(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        // Se a API apagar com sucesso, removemos da tela
        this.notificacoes = this.notificacoes.filter(n => n.id !== id);
      },
      error: (err) => console.error('Erro ao deletar notificação na API', err)
    });
  }
}