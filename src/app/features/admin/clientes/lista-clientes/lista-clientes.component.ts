import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environments';

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
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (dados) => {
        this.clientes = dados;
        this.calcularEstatisticas();
      },
      error: (erro) => console.error('Erro ao buscar clientes:', erro)
    });
  }

  // O Angular calcula as estatísticas em milissegundos sem precisar de mais consultas SQL!
  calcularEstatisticas() {
    this.totalClientes = this.clientes.length;
    
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
    
    if (this.isEditMode && cliente) {
      this.clienteForm = { ...cliente, senha: '' }; // A senha vem em branco por segurança
    } else {
      this.clienteForm = { nome: '', senha: '', status: 'ativo' }; // Form limpo
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
