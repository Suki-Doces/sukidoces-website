import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ImageFormatPipe } from 'src/app/shared/pipes/image-format.pipe';
import { environment } from 'src/environments/environment';

interface Pedido {
  id_pedido: number;
  cliente_nome: string;
  cliente_email: string;
  data_pedido: Date | string;
  status: 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';
  valor_total: number;
  metodo_pagamento: string;
  itens?: { nome: string; quantidade: number; imagem?: string }[];
}

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageFormatPipe],
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.css']
})
export class ListaPedidosComponent implements OnInit {
  private http = inject(HttpClient);
  
  // CORRIGIDO: Agora usa a URL dinâmica do ambiente (localhost ou Vercel)
  private apiUrl = `${environment.apiUrl}/pedidos`;

  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];

  filtroStatus: string = 'todos';
  busca: string = '';
  isLoading = true;

  // --- Contadores Estatísticos ---
  get totalPedidos() { return this.pedidos.length; }
  get totalConcluidos() { return this.pedidos.filter(p => p.status === 'entregue').length; }
  get totalPendentes() { return this.pedidos.filter(p => p.status === 'pendente').length; }
  get totalCancelados() { return this.pedidos.filter(p => p.status === 'cancelado').length; }
  get totalVendas() {
    return this.pedidos
      .filter(p => ['pago', 'enviado', 'entregue'].includes(p.status))
      .reduce((sum, p) => sum + Number(p.valor_total), 0);
  }

  ngOnInit() {
    this.carregarPedidos();
  }

  carregarPedidos() {
    this.isLoading = true;
    this.http.get<Pedido[]>(this.apiUrl).subscribe({
      next: (dados) => {
        this.pedidos = dados;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar pedidos:', err);
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros() {
    this.pedidosFiltrados = this.pedidos.filter(p => {
      const matchStatus = this.filtroStatus === 'todos' || p.status === this.filtroStatus;
      const termo = this.busca.toLowerCase();
      const matchBusca = !termo ||
        p.id_pedido.toString().includes(termo) ||
        p.cliente_nome.toLowerCase().includes(termo) ||
        p.cliente_email?.toLowerCase().includes(termo);
      return matchStatus && matchBusca;
    });
  }

  setFiltroStatus(status: string, event: Event) {
    event.preventDefault();
    this.filtroStatus = status;
    this.aplicarFiltros();
  }

  // --- Ação de Atualizar Status ---
  updateStatus(pedido: Pedido, novoStatus: string) {
    if (!confirm(`Deseja alterar o pedido #${pedido.id_pedido} para "${novoStatus.toUpperCase()}"?`)) return;

    this.http.patch(`${this.apiUrl}/${pedido.id_pedido}/status`, { status: novoStatus })
      .subscribe({
        next: () => {
          pedido.status = novoStatus as any;
          this.aplicarFiltros();
        },
        error: (err) => {
          console.error('Erro ao atualizar status:', err);
          alert('Erro ao atualizar status no servidor.');
        }
      });
  }

  // --- Helpers de Formatação ---
  formatarData(data: Date | string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatarMetodo(metodo: string): string {
    const metodos: any = { pix: 'PIX', cartao: 'Cartão', boleto: 'Boleto' };
    return metodos[metodo] || metodo;
  }
}
