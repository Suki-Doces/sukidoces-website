import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Importação necessária

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-produtos.component.html',
  styleUrls: ['./lista-produtos.component.css']
})
export class ListaProdutosComponent implements OnInit {
  
  // Injetando o HttpClient para fazer as requisições
  private http = inject(HttpClient);

  // Agora começamos com o array vazio, pois os dados virão do banco
  categorias: any[] = [];

  // Objeto para guardar os dados do formulário
  produto = {
    nome: '',
    id_categoria: '',
    preco: null,
    quantidade: null,
    imagem: null as File | null
  };

  mostrarPopupSucesso = false;
  mensagemErro = '';

  ngOnInit() {
    this.carregarCategorias();
  }

  // Busca as categorias reais na sua API Node.js
  // Busca as categorias reais na sua API Node.js
  carregarCategorias() {
    this.http.get<any[]>('http://localhost:3000/suki-doces/admin/categorias')
      .subscribe({
        next: (dados) => {
          this.categorias = dados;
          console.log('Categorias carregadas do banco:', this.categorias);
        },
        error: (erro) => {
          console.error('Erro ao buscar categorias:', erro);
          this.mensagemErro = 'Não foi possível carregar as categorias do banco.';
        }
      });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.produto.imagem = file;
    }
  }

  adicionarProduto() {
    if (!this.produto.nome || !this.produto.id_categoria || !this.produto.preco || !this.produto.quantidade) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.mensagemErro = '';

    // FUTURO: Envio dos dados via FormData para o backend
    console.log('Enviando produto com categoria real:', this.produto);

    this.mostrarPopupSucesso = true;
  }

  fecharPopup() {
    this.mostrarPopupSucesso = false;
    this.produto = { nome: '', id_categoria: '', preco: null, quantidade: null, imagem: null };
  }
}