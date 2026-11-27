import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AdminPageHeaderComponent } from 'src/app/shared/components/admin-page-header/admin-page-header.component';
import { AdminIconComponent } from 'src/app/shared/components/admin-icon/admin-icon.component';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, AdminPageHeaderComponent, AdminIconComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly API_URL = `${environment.apiUrl}/admin/dashboard`;

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

  paginaAtual = 1;
  itensPorPagina = 5;

  // 1. Variável para guardar o resultado da pesquisa 
  transacoesFiltradas: any[] = [];

  isLoading = true;
  lastId = 0;
  private pollingSub!: Subscription;

  constructor(private http: HttpClient) { }

  // 2. CORRIGIDO AQUI: O get agora corta a lista FILTRADA, não a original!
  get transacoesPaginadas(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.transacoesFiltradas.slice(inicio, fim);
  }

  // 3. CORRIGIDO AQUI: Calcula o total de páginas com base na lista FILTRADA
  get totalPaginas(): number {
    return Math.ceil(this.transacoesFiltradas.length / this.itensPorPagina) || 1;
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, index) => index + 1);
  }

  get inicioRegistros(): number {
    return this.transacoesFiltradas.length === 0
      ? 0
      : (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get fimRegistros(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.transacoesFiltradas.length);
  }

  variacaoTexto(valor: number): string {
    if (valor > 0) return `+${valor}%`;
    if (valor < 0) return `${valor}%`;
    return '0%';
  }

  variacaoClass(valor: number): string {
    return valor > 0 ? 'text-green' : valor < 0 ? 'text-red' : 'text-gray';
  }

  valorVendido(produto: any): number {
    return Number(produto.vendas || 0) * Number(produto.preco || 0);
  }

  getBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pago: 'admin-badge--success',
      entregue: 'admin-badge--success',
      pendente: 'admin-badge--pending',
      cancelado: 'admin-badge--danger',
      enviado: 'admin-badge--info'
    };
    return classes[(status || '').toLowerCase()] || 'admin-badge--info';
  }

  formatarPagamento(metodo?: string | null): string {
    if (!metodo) return '—';
    const valor = metodo.toLowerCase();
    if (valor.includes('cart')) return 'Cartão';
    if (valor === 'pix') return 'Pix';
    if (valor === 'boleto') return 'Boleto';
    return metodo.charAt(0).toUpperCase() + metodo.slice(1);
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
  }

  ngOnInit() {
    this.carregarDashboard()

    this.pollingSub = interval(30000).subscribe(() => {
      this.fetchNovasTransacoes();
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  getProductImage(imageURL: string | null): string {
    if (!imageURL) return this.defaultImage;
    if (imageURL.startsWith('http') || imageURL.startsWith('data:image')) {
      return imageURL;
    }
    if (imageURL.startsWith('assets/')) {
      return imageURL;
    }
    return `assets/images/produtos/${imageURL}`;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

  carregarDashboard() {
    this.isLoading = true;
    this.http.get<any>(this.API_URL).subscribe({
      next: (dados) => {
        this.resumo = dados.resumo;
        this.produtosDestaque = [...dados.produtosDestaque]
          .sort((a, b) => b.vendas - a.vendas)
          .slice(0, 4);

        this.transacoes = dados.transacoes;

        // 4. ADICIONADO AQUI: Assim que chegar da API, clonamos para a lista filtrada
        this.transacoesFiltradas = [...this.transacoes];

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
    this.http.get<any>(this.API_URL).subscribe({
      next: (dados) => {
        const todasTransacoes: any[] = dados.transacoes;
        const novas = todasTransacoes.filter(t => t.id_pedido > this.lastId);

        if (novas.length > 0) {
          this.transacoes = [...novas, ...this.transacoes];

          // 5. ADICIONADO AQUI: Atualiza a lista filtrada quando chegam pedidos novos
          this.transacoesFiltradas = [...this.transacoes];

          this.lastId = Math.max(...novas.map(t => t.id_pedido));

          if (this.paginaAtual > this.totalPaginas) {
            this.paginaAtual = this.totalPaginas;
          }

          this.resumo = dados.resumo;
        }
      },
      error: (err) => console.error('Erro no polling:', err)
    });
  }

  // 6. ADICIONADO AQUI: A função que faz a pesquisa funcionar!
  filtrarTransacoes(event: Event) {
    const termo = (event.target as HTMLInputElement).value.toLowerCase().trim();

    if (!termo) {
      // Se a caixa de pesquisa estiver vazia, restaura tudo
      this.transacoesFiltradas = [...this.transacoes];
    } else {
      // Filtra por nome do cliente ou ID
      this.transacoesFiltradas = this.transacoes.filter(tx =>
        (tx.cliente_nome ?? '').toLowerCase().includes(termo) ||
        tx.id_pedido.toString().includes(termo)
      );
    }
    // Volta sempre para a página 1 ao fazer uma nova pesquisa
    this.paginaAtual = 1;
  }

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

  formatarData(data: string): string {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
}