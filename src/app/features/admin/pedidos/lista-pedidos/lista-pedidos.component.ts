import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definindo o formato do pedido com base no seu banco de dados
interface Pedido {
  id_pedido: number;
  cliente_nome: string;
  endereco_entrega: string;
  data_pedido: Date;
  status: 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';
  valor_total: number;
}

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.css']
})
export class ListaPedidosComponent implements OnInit {
  // --- Dados Simulados (Mock) ---
  pedidos: Pedido[] = [
    { id_pedido: 1001, cliente_nome: 'Tiago Oliveira', endereco_entrega: 'Rua A, 123 - Santo André', data_pedido: new Date('2026-04-20T10:30:00'), status: 'pago', valor_total: 150.50 },
    { id_pedido: 1002, cliente_nome: 'Maria Souza', endereco_entrega: 'Av. B, 45 - São Bernardo', data_pedido: new Date('2026-04-21T14:20:00'), status: 'enviado', valor_total: 89.90 },
    { id_pedido: 1003, cliente_nome: 'Carlos Eduardo', endereco_entrega: 'Retirada na Loja', data_pedido: new Date('2026-04-22T09:15:00'), status: 'pendente', valor_total: 45.00 },
    { id_pedido: 1004, cliente_nome: 'Ana Clara', endereco_entrega: 'Rua C, 99 - Diadema', data_pedido: new Date('2026-04-18T16:45:00'), status: 'entregue', valor_total: 210.00 },
    { id_pedido: 1005, cliente_nome: 'Pedro Alves', endereco_entrega: 'Rua D, 12 - São Paulo', data_pedido: new Date('2026-04-19T11:10:00'), status: 'cancelado', valor_total: 35.50 },
  ];

  pedidosFiltrados: Pedido[] = [];
  filtroStatus: string = 'todos';
  busca: string = '';

  // --- Contadores Estatísticos Dinâmicos ---
  get totalPedidos() { return this.pedidos.length; }
  get totalConcluidos() { return this.pedidos.filter(p => p.status === 'entregue').length; }
  get totalPendentes() { return this.pedidos.filter(p => p.status === 'pendente').length; }
  get totalCancelados() { return this.pedidos.filter(p => p.status === 'cancelado').length; }

  ngOnInit() {
    // Inicializa a lista mostrando todos
    this.aplicarFiltros();
  }

  // --- Lógica de Filtro e Busca ---
  aplicarFiltros() {
    this.pedidosFiltrados = this.pedidos.filter(p => {
      // Verifica Aba
      const matchStatus = this.filtroStatus === 'todos' || p.status === this.filtroStatus;
      // Verifica Busca (Nome ou ID)
      const termo = this.busca.toLowerCase();
      const matchBusca = p.id_pedido.toString().includes(termo) || p.cliente_nome.toLowerCase().includes(termo);
      
      return matchStatus && matchBusca;
    });
  }

  setFiltroStatus(status: string, event: Event) {
    event.preventDefault(); // Evita que o link '# ' recarregue a tela
    this.filtroStatus = status;
    this.aplicarFiltros();
  }

  // --- Ações dos Botões ---
  updateStatus(pedido: Pedido, novoStatus: 'enviado' | 'entregue') {
    if (confirm(`Deseja alterar o status do pedido #${pedido.id_pedido} para ${novoStatus.toUpperCase()}?`)) {
      pedido.status = novoStatus;
      this.aplicarFiltros(); // Atualiza a tela instantaneamente
      
      // FUTURO: Aqui vai a chamada pro Node.js
      // this.http.post('http://localhost:3000/api/admin/pedidos/status', { id: pedido.id_pedido, status: novoStatus }).subscribe(...);
    }
  }
}