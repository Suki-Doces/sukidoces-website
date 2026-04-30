import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Importação necessária
import { environment } from 'src/environments/environments';

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
  // Objeto para guardar os dados do formulário
  produto = {
    nome: '',
    id_categoria: '',
    preco: null as number | null, // <--- Avisamos que é número ou nulo
    quantidade: null as number | null, // <--- Avisamos que é número ou nulo
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
    this.http.get<any[]>(`${environment.apiUrl}/admin/categorias`)
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

  // Função disparada ao clicar em "Adicionar Produto"
  adicionarProduto() {
    // 1. Validação básica
    if (!this.produto.nome || !this.produto.id_categoria || !this.produto.preco || !this.produto.quantidade) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.mensagemErro = ''; // Limpa os erros

    // 2. Cria o FormData (O "pacote" de envio que suporta arquivos)
    const formData = new FormData();
    formData.append('nome', this.produto.nome);
    formData.append('id_categoria', this.produto.id_categoria);
    formData.append('preco', String(this.produto.preco)); // <--- Mais seguro
    formData.append('quantidade', String(this.produto.quantidade)); // <--- Mais seguro
    
    if (this.produto.imagem) {
      formData.append('imagem', this.produto.imagem);
    }

    console.log('Enviando pacote FormData para a API...');

    // 3. Faz o POST para o Node.js
    // Ajuste a URL caso a sua rota de produtos seja diferente
    const apiUrl = `${environment.apiUrl}/produtos`;

    this.http.post(apiUrl, formData).subscribe({
      next: (resposta) => {
        console.log('Sucesso! Resposta do servidor:', resposta);
        this.mostrarPopupSucesso = true; // Abre o Pop-up de sucesso!
      },
      error: (erro) => {
        console.error('Erro ao salvar o produto:', erro);
        this.mensagemErro = 'Erro ao salvar o produto. O console tem mais detalhes.';
      }
    });
  }

  fecharPopup() {
    this.mostrarPopupSucesso = false;
    this.produto = { nome: '', id_categoria: '', preco: null, quantidade: null, imagem: null };
  }
}