import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  // Dados simulados baseados no seu banco
  categorias: Categoria[] = [
    { id_categoria: 1, nome: 'Chocolates', descricao: 'Barras, bombons e trufas' },
    { id_categoria: 2, nome: 'Bebidas', descricao: 'Refrigerantes, sucos e águas' },
    { id_categoria: 3, nome: 'Salgadinhos', descricao: 'Chips e snacks diversos' }
  ];

  // Objeto que o formulário usa
  categoriaSelecionada: Categoria = { id_categoria: 0, nome: '', descricao: '' };
  
  // Controle de estado
  isEditMode = false;

  ngOnInit(): void {}

  // Salvar (Adicionar ou Atualizar)
  salvar() {
    if (!this.categoriaSelecionada.nome) return;

    if (this.isEditMode) {
      // Lógica de Atualização
      const index = this.categorias.findIndex(c => c.id_categoria === this.categoriaSelecionada.id_categoria);
      if (index !== -1) {
        this.categorias[index] = { ...this.categoriaSelecionada };
      }
    } else {
      // Lógica de Adição
      const novoId = this.categorias.length > 0 ? Math.max(...this.categorias.map(c => c.id_categoria)) + 1 : 1;
      this.categorias.push({
        ...this.categoriaSelecionada,
        id_categoria: novoId
      });
    }

    this.resetForm();
  }

  // Entrar no modo de edição (Igual ao seu editCategory no PHP)
  editar(cat: Categoria) {
    this.isEditMode = true;
    this.categoriaSelecionada = { ...cat };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Deletar categoria
  deletar(id: number) {
    if (confirm('Tem certeza? Isso pode afetar produtos vinculados a esta categoria.')) {
      this.categorias = this.categorias.filter(c => c.id_categoria !== id);
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.categoriaSelecionada = { id_categoria: 0, nome: '', descricao: '' };
  }
}