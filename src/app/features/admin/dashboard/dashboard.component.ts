import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly API_URL = `${environment.apiUrl}/admin/dashboard`;

  // CORRIGIDO: dados agora vêm da API, não são hardcoded
  resumo = {
    vendasSemana: 0,
    aumentoVendas: 0,
    vendasPassada: 0,
    pedidosSemana: 0,
    aumentoPedidos: 0,
    pedidosPassada: 0,
    pendentes: 0,
    cancelados: 0,
    totalVendas: 0,
    totalPedidos: 0
  };

  produtosDestaque: any[] = [];
  transacoes: any[] = [];

  isLoading = true;
  lastId = 0;
  private pollingSub!: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Carrega dados reais na inicialização
    this.carregarDashboard();

    // Polling a cada 30 segundos para novos pedidos
    this.pollingSub = interval(30000).subscribe(() => {
      this.fetchNovasTransacoes();
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }

  carregarDashboard() {
    this.isLoading = true;
    this.http.get<any>(this.API_URL).subscribe({
      next: (dados) => {
        this.resumo = dados.resumo;
        this.produtosDestaque = dados.produtosDestaque;
        this.transacoes = dados.transacoes;

        // Atualiza o lastId para o polling saber de onde continuar
        if (this.transacoes.length > 0) {
          this.lastId = Math.max(...this.transacoes.map((t: any) => t.id_pedido));
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  fetchNovasTransacoes() {
    // Busca apenas pedidos mais recentes que o último ID conhecido
    this.http.get<any>(this.API_URL).subscribe({
      next: (dados) => {
        const todasTransacoes: any[] = dados.transacoes;
        const novas = todasTransacoes.filter(t => t.id_pedido > this.lastId);

        if (novas.length > 0) {
          // Adiciona no topo da lista
          this.transacoes = [...novas, ...this.transacoes];
          this.lastId = Math.max(...novas.map(t => t.id_pedido));

          // Atualiza contadores também
          this.resumo = dados.resumo;
        }
      },
      error: (err) => console.error('Erro no polling:', err)
    });
  }

  // Formata o status para exibição
  getStatusClass(status: string): string {
    const classes: any = {
      pago: 'status-pago',
      pendente: 'status-pendente',
      enviado: 'status-enviado',
      entregue: 'status-entregue',
      cancelado: 'status-cancelado'
    };
    return classes[status] || '';
  }

  // Formata data para exibição
  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
    });
  }
}