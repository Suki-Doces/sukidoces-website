import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environments';

interface Categoria {
  id_categoria: number;
  nome: string;
  descricao: string;
}

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-categorias.component.html',
  styleUrls: ['./lista-categorias.component.css']
})
export class ListaCategoriasComponent implements OnInit {
  // Injetamos o HttpClient para poder fazer requisições
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/categorias`; // Endereço da sua API Node.js

  // A lista começa vazia, pois os dados virão do banco MySQL
  categorias: Categoria[] = [];

  categoriaSelecionada: Categoria = { id_categoria: 0, nome: '', descricao: '' };
  isEditMode = false;

  ngOnInit(): void {
    // Ao carregar a tela, busca as categorias do Node.js
    this.carregarCategorias();
  }

  // Busca as categorias reais na sua API Node.js
  // Busca as categorias reais no banco
  carregarCategorias() {
    this.http.get<Categoria[]>(this.apiUrl).subscribe({
      next: (dados: any) => {
        this.categorias = dados;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar categorias:', erro);
        alert('Erro ao conectar com o servidor Node.js!');
      }
    });
  }

  // Salvar (Adicionar no Banco ou Atualizar)
  salvar() {
    if (!this.categoriaSelecionada.nome) return;

    if (this.isEditMode) {
      // PUT: Atualiza no banco
      this.http.put(`${this.apiUrl}/${this.categoriaSelecionada.id_categoria}`, this.categoriaSelecionada)
        .subscribe({
          next: () => {
            this.carregarCategorias(); // Recarrega a tabela atualizada
            this.resetForm();
          },
          error: (e: any) => console.error(e)
        });
    } else {
      // POST: Cria novo no banco
      this.http.post(this.apiUrl, { 
        nome: this.categoriaSelecionada.nome, 
        descricao: this.categoriaSelecionada.descricao 
      }).subscribe({
        next: () => {
          this.carregarCategorias(); // Recarrega a tabela com o item novo
          this.resetForm();
        },
        error: (e: any) => console.error(e)
      });
    }
  }

  editar(cat: Categoria) {
    this.isEditMode = true;
    this.categoriaSelecionada = { ...cat };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // DELETE: Remove do banco
  deletar(id: number) {
    if (confirm('Tem certeza? Isso pode afetar produtos vinculados a esta categoria.')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.carregarCategorias(); // Recarrega a tabela após apagar
        },
        error: (e: any) => {
          console.error(e);
          alert('Erro ao deletar categoria.');
        }
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.categoriaSelecionada = { id_categoria: 0, nome: '', descricao: '' };
  }
}