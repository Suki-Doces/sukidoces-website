import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

// 💡 ATUALIZAÇÃO: Adicionado o campo 'estatisticas' à interface
interface PaginacaoClientes {
  clientes: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  estatisticas: {
    novosClientesUltimos7Dias: number;
  };
}

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css']
})
export class ListaClientesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/clientes`;

  clientes: any[] = [];
  totalClientes: number = 0;
  novosClientes: number = 0; // Este valor será recebido da API

  // Paginação
  paginaAtual = 1;
  limite = 5;
  totalPaginas = 1;

  // Controles do Modal
  isModalOpen = false;
  isEditMode = false;
  clienteForm: any = {
    nome: '',
    senha: '',
    status: 'ativo'
  };

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.http.get<PaginacaoClientes>(`${this.apiUrl}?page=${this.paginaAtual}&limit=${this.limite}`).subscribe({
      next: (dados) => {
        this.clientes = dados.clientes;
        this.totalClientes = dados.pagination.total;
        this.totalPaginas = dados.pagination.totalPages;
        
        // 💡 CORREÇÃO: Lê o valor global vindo do banco de dados (não calcula mais localmente)
        this.novosClientes = dados.estatisticas.novosClientesUltimos7Dias;
      },
      error: (erro) => console.error('Erro ao buscar clientes:', erro)
    });
  }

  mudarPagina(novaPagina: number) {
    if (novaPagina > 0 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
      this.carregarClientes();
    }
  }

  obterPaginasArray(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // 💡 O MÉTODO calcularEstatisticas() PODE SER APAGADO AGORA, 
  // pois não é mais necessário.

  abrirModal(modo: 'adicionar' | 'editar', cliente?: any) {
    this.isEditMode = modo === 'editar';
    
    if (this.isEditMode && cliente) {
      this.clienteForm = { 
        id_cliente: cliente.id_cliente,
        nome: cliente.nome,
        email: cliente.email,
        status: cliente.status 
      }; 
    } else {
      this.clienteForm = { nome: '', email: '', senha: '', status: 'ativo' };
    }
    
    this.isModalOpen = true;
  }

  fecharModal() {
    this.isModalOpen = false;
  }

  salvarCliente() {
    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${this.clienteForm.id_cliente}`, this.clienteForm).subscribe({
        next: () => {
          this.carregarClientes();
          this.fecharModal();
        },
        error: () => alert('Erro ao atualizar cliente.')
      });
    } else {
      this.http.post(this.apiUrl, this.clienteForm).subscribe({
        next: () => {
          this.carregarClientes();
          this.fecharModal();
        },
        error: () => alert('Erro ao adicionar cliente.')
      });
    }
  }

  deletarCliente(id: number) {
    if (confirm('Tem a certeza que deseja deletar este cliente permanentemente?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.carregarClientes(),
        error: () => alert('Erro ao deletar cliente.')
      });
    }
  }
}