import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dados de Resumo (Você conectará no backend depois)
  resumo = {
    vendasSemana: 2000,
    aumentoVendas: 10.4,
    vendasPassada: 1640,
    pedidosSemana: 1440,
    aumentoPedidos: 17.4,
    pedidosPassada: 1260,
    pendentes: 509,
    cancelados: 94
  };

  // Produtos em Destaque (Transformado em Array para o HTML ficar limpo)
  produtosDestaque = [
    { nome: 'Kit Kat', vendas: 74, status: 'Em Estoque', corStatus: '#21c45d', valor: 3.00, img: 'Kit Kat - img.jpg' },
    { nome: 'Kinder Bueno', vendas: 56, status: 'Sem Estoque', corStatus: '#ef4343', valor: 4.50, img: 'Kinder Bueno - Img.jpg' },
    { nome: 'Monster Energy', vendas: 98, status: 'Em Estoque', corStatus: '#21c45d', valor: 10.00, img: 'Energy Monster - Img.jpg' },
    { nome: 'Torrada Tradicional', vendas: 33, status: 'Em Estoque', corStatus: '#21c45d', valor: 5.50, img: 'Torrada Bauducco - img.webp' }
  ];

  // Transações (A tabela debaixo)
  transacoes: any[] = [
    // Dados iniciais baseados no seu PHP original
    { id_pedido: 1, cliente_nome: '#6545', data_pedido: '01 Outubro | 19:20', status: 'pago', valor_total: 64 },
    { id_pedido: 2, cliente_nome: '#5412', data_pedido: '02 Outubro | 11:45', status: 'pendente', valor_total: 32 },
    { id_pedido: 3, cliente_nome: '#6622', data_pedido: '02 Outubro | 13:45', status: 'pago', valor_total: 16 },
    { id_pedido: 4, cliente_nome: '#6796', data_pedido: '02 Outubro | 17:22', status: 'pago', valor_total: 25 },
    { id_pedido: 5, cliente_nome: '#6546', data_pedido: '03 Outubro | 9:45', status: 'pendente', valor_total: 65 }
  ];

  lastId = 5; // Guarda o último ID lido
  private pollingSub!: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Inicia o Polling (Substitui o setInterval do transactions-polling.js)
    // A cada 10000ms (10 segundos), chama a função fetchNovasTransacoes
    this.pollingSub = interval(10000).subscribe(() => {
      this.fetchNovasTransacoes();
    });
  }

  ngOnDestroy() {
    // Quando você trocar de página, isso desliga o polling para não pesar o navegador
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  fetchNovasTransacoes() {
    // FUTURO: Aqui chamaremos o seu Node.js (sukidoces-service)
    /*
    this.http.get<any[]>(`http://localhost:3000/api/admin/transacoes?last_id=${this.lastId}`).subscribe({
      next: (novasTransacoes) => {
        if (novasTransacoes && novasTransacoes.length > 0) {
          // Adiciona as novas transações na lista
          this.transacoes = [...this.transacoes, ...novasTransacoes];
          
          // Atualiza o lastId para o maior ID recebido
          const maxId = Math.max(...novasTransacoes.map(t => parseInt(t.id_pedido)));
          if (maxId > this.lastId) {
            this.lastId = maxId;
          }
        }
      },
      error: (err) => console.error('Erro ao buscar transações:', err)
    });
    */
    console.log('Verificando novas transações... (Simulação)');
  }
}