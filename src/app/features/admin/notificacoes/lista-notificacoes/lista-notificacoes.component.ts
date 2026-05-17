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
    this.http.get<any>(this.apiUrl).subscribe({
      next: (dados) => {
        this.notificacoes = dados.notifications.map((n: any) => {
          return {
            id: n.id_notificacao,
            mensagem: n.mensagem,
            tempo: new Date(n.data_criacao).toLocaleDateString('pt-BR'),
            icone: this.getIconePorTipo(n.tipo),
            lida: n.lido
          };
        });
      },
      error: (erro) => {
        console.log('API de notificações não encontrada, usando dados de teste.', erro);
        // PLANO B (Fallback) com caminhos corretos e capitalização exata
        this.notificacoes = [
          { id: 1, mensagem: 'O Cliente Ruben Amorin usou o cupom de 20% na sua compra.', tempo: '1m ago', icone: 'assets/images/icons/Cupom - icon.svg', lida: false },
          { id: 2, mensagem: 'Nova compra realizada número do Pedido #00399', tempo: '5m ago', icone: 'assets/images/icons/Payment - icon.svg', lida: false },
          { id: 3, mensagem: 'Acabou o estoque do produto Minalba 250ml', tempo: '1h ago', icone: 'assets/images/icons/Storage - Icon.svg', lida: true },
          { id: 4, mensagem: 'Novo cadastro! Larissa Almeida criou uma conta.', tempo: '2h ago', icone: 'assets/images/icons/User - Icon.svg', lida: true }
        ];
      }
    });
  }

  // Função auxiliar para escolher o ícone com os caminhos corretos da pasta
  getIconePorTipo(tipo: string): string {
    switch(tipo) {
      case 'usuario': return 'assets/images/icons/User - Icon.svg';
      case 'pedido': return 'assets/images/icons/Payment - icon.svg';
      case 'carrinho': return 'assets/images/icons/Storage - Icon.svg'; // Utilizando o ícone de Storage (Estoque) aqui
      default: return 'assets/images/icons/Message - icon.svg'; // Utilizando o Message Icon como padrão para notificações
    }
  }

  marcarTodasComoLidas() {
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        this.notificacoes.forEach(n => n.lida = true);
      },
      error: (err) => console.error('Erro ao marcar como lidas na API', err)
    });
  }

  fecharNotificacao(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.notificacoes = this.notificacoes.filter(n => n.id !== id);
      },
      error: (err) => console.error('Erro ao deletar notificação na API', err)
    });
  }
}
