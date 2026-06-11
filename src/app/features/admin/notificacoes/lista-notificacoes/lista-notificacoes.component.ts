import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Notificacao {
  id: number;
  mensagem: string;
  tempo: string;
  icone: string;
  lida: boolean;
}

interface PaginacaoResponse {
  notifications: any[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
  paginaAtual = 1;
  limite = 4;
  totalPaginas = 1;
  totalNotificacoes = 0;

  private apiUrl = `${environment.apiUrl}/admin/notificacoes`;

  ngOnInit() {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    this.http.get<PaginacaoResponse>(`${this.apiUrl}?page=${this.paginaAtual}&limit=${this.limite}`).subscribe({
      next: (dados) => {
        this.notificacoes = dados.notifications.map((n: any) => {
          return {
            id: n.id_notificacao,
            mensagem: n.mensagem,
            tempo: new Date(n.data_criacao).toLocaleDateString('pt-BR'),
            icone: this.getIconePorTipo(n.tipo, n.mensagem),
            lida: n.lido
          };
        });
        
        this.totalNotificacoes = dados.pagination.total;
        this.totalPaginas = dados.pagination.totalPages;
      },
      error: (erro) => {
        console.error('Erro ao carregar notificações:', erro);
      }
    });
  }

  mudarPagina(novaPagina: number) {
    if (novaPagina > 0 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
      this.carregarNotificacoes();
    }
  }

  obterPaginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // LÓGICA ATUALIZADA: Ícones customizados sem interferir no ícone de pagamento para pedidos pagos
  getIconePorTipo(tipo: string, mensagem: string): string {
    const msg = mensagem.toLowerCase();

    // 1. Pedido Cancelado (Prioridade total)
    if (msg.includes('cancelado')) {
      return 'assets/images/icons/Pedido-cancelado.svg';
    }

    // 2. Pedido feito mas ainda não pago (Pendente)
    // Se a mensagem diz 'pedido' e não diz 'pago', é o ícone de 'pendente/novo pedido'
    if (msg.includes('pendente') || (msg.includes('pedido') && !msg.includes('pago'))) {
      return 'assets/images/icons/Pedido-de-Icon.svg';
    }

    // 3. Mudança de Status (Refresh) - Removido 'pago' daqui
    // Agora só dispara refresh se for alteração de status ou envio/entrega
    if (msg.includes('status') || 
        msg.includes('atualizado') || 
        msg.includes('enviado') || 
        msg.includes('entregue')) {
      return 'assets/images/icons/status-refresh-icon.svg';
    }

    // Fallback: Usa o tipo da notificação vindo do banco
    switch(tipo) {
      case 'usuario': return 'assets/images/icons/User - Icon.svg';
      case 'venda': return 'assets/images/icons/Payment - icon.svg'; // Ícone de pagamento para vendas/pedidos pagos
      case 'carrinho': return 'assets/images/icons/Storage - Icon.svg';
      default: return 'assets/images/icons/Message - icon.svg';
    }
  }

  marcarTodasComoLidas() {
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        this.notificacoes.forEach(n => n.lida = true);
      },
      error: (err) => console.error('Erro ao marcar como lidas', err)
    });
  }

  fecharNotificacao(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.notificacoes = this.notificacoes.filter(n => n.id !== id);
      },
      error: (err) => console.error('Erro ao deletar notificação', err)
    });
  }
}