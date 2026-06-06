import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

interface PaginacaoClientes {
  clientes: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
  novosClientes: number = 0;

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
        this.calcularEstatisticas();
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

  // O Angular calcula as estatísticas em milissegundos sem precisar de mais consultas SQL!
  calcularEstatisticas() {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    this.novosClientes = this.clientes.filter(c => {
      // Usa data_cadastro se existir, senão assume 0
      if (!c.data_cadastro) return false;
      return new Date(c.data_cadastro) >= seteDiasAtras;
    }).length;
  }

  abrirModal(modo: 'adicionar' | 'editar', cliente?: any) {
    this.isEditMode = modo === 'editar';
    
    // CORREÇÃO AQUI: Remoção do campo 'senha' no momento da edição
    if (this.isEditMode && cliente) {
      this.clienteForm = { 
        id_cliente: cliente.id_cliente,
        nome: cliente.nome,
        email: cliente.email,
        status: cliente.status 
      }; 
    } else {
      this.clienteForm = { nome: '', email: '', senha: '', status: 'ativo' }; // Form limpo
    }
    
    this.isModalOpen = true;
  }

  fecharModal() {
    this.isModalOpen = false;
  }

  salvarCliente() {
    // Se for edição, usamos o PUT e passamos o ID. Se for novo, usamos POST.
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
        error: () => alert('Erro ao adicionar cliente. O e-mail pode já existir.')
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