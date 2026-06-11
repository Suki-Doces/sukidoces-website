import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// Define o formato esperado para exibir a notificação no front
interface Notificacao {
  id: number;
  mensagem: string;
  tempo: string;
  icone: string;
  lida: boolean;
}

// Define o formato da resposta que vem da API (com paginação)
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
  
  // Estado inicial das notificações
  notificacoes: Notificacao[] = [];
  paginaAtual = 1;
  limite = 4;
  totalPaginas = 1;
  totalNotificacoes = 0;

  private apiUrl = `${environment.apiUrl}/admin/notificacoes`;

  ngOnInit() {
    this.carregarNotificacoes();
  }

  // Busca dados da API e transforma o formato do banco (n) para o formato do componente
  carregarNotificacoes() {
    this.http.get<PaginacaoResponse>(`${this.apiUrl}?page=${this.paginaAtual}&limit=${this.limite}`).subscribe({
      next: (dados) => {
        // Mapeia os dados brutos da API para a interface Notificacao
        this.notificacoes = dados.notifications.map((n: any) => {
          return {
            id: n.id_notificacao,
            mensagem: n.mensagem,
            tempo: new Date(n.data_criacao).toLocaleDateString('pt-BR'),
            icone: this.getIconePorTipo(n.tipo, n.mensagem), // Passa tipo e mensagem para decidir o ícone
            lida: n.lido
          };
        });
        
        // Atualiza controle de paginação
        this.totalNotificacoes = dados.pagination.total;
        this.totalPaginas = dados.pagination.totalPages;
      },
      error: (erro) => {
        console.error('Erro ao carregar notificações:', erro);
      }
    });
  }

  // Navegação entre páginas
  mudarPagina(novaPagina: number) {
    if (novaPagina > 0 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
      this.carregarNotificacoes();
    }
  }

  // Cria um array de números para o loop de paginação no HTML (ex: [1, 2, 3])
  obterPaginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Lógica de prioridade para os ícones
  // O código lê de cima para baixo: a regra mais específica deve vir primeiro
  getIconePorTipo(tipo: string, mensagem: string): string {
    const msg = mensagem.toLowerCase();

    // 1. Cancelamento tem prioridade máxima
    if (msg.includes('cancelado')) {
      return 'assets/images/icons/Pedido-cancelado.svg';
    }

    // 2. Mudança de status (refresh)
    if (msg.includes('enviado') || msg.includes('status') || msg.includes('atualizado')) {
      return 'assets/images/icons/status-refresh-icon.svg';
    }

    // 3. Novo pedido (pendente) - apenas se for pedido E não for pago
    if (msg.includes('pedido') && !msg.includes('pago')) {
      return 'assets/images/icons/Pedido-de-Icon.svg';
    }

    // 4. Regras padrão para outros tipos caso não caia nas regras acima
    switch(tipo) {
      case 'usuario': return 'assets/images/icons/User - Icon.svg';
      case 'venda':   return 'assets/images/icons/Payment - icon.svg';
      case 'carrinho': return 'assets/images/icons/Storage - Icon.svg';
      default: return 'assets/images/icons/Message - icon.svg';
    }
  }

  // Requisição para marcar todas as mensagens como lidas
  marcarTodasComoLidas() {
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        this.notificacoes.forEach(n => n.lida = true);
      },
      error: (err) => console.error('Erro ao marcar como lidas na API', err)
    });
  }

  // Deleta uma notificação específica
  fecharNotificacao(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        // Remove da lista local para atualizar a UI instantaneamente
        this.notificacoes = this.notificacoes.filter(n => n.id !== id);
      },
      error: (err) => console.error('Erro ao deletar notificação na API', err)
    });
  }
}