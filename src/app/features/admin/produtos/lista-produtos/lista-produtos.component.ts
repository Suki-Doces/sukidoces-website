import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

type ProdutoForm = {
  nome?: string | null;
  descricao?: string | null;
  id_categoria?: string | number | null;
  preco?: number | string | null;
  quantidade?: number | string | null;
  imagem?: File | null;
};

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-produtos.component.html',
  styleUrls: ['./lista-produtos.component.css']
})
export class ListaProdutosComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly apiUrlProdutos = `${environment.apiUrl}/produtos`;
  private readonly tamanhoMaximoImagem = 5 * 1024 * 1024;
  private readonly tiposImagemPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

  categorias: any[] = [];

  produto = {
    nome: '',
    id_categoria: '',
    preco: null as number | null,
    quantidade: null as number | null,
    imagem: null as File | null
  };

  mostrarPopupSucesso = false;
  mensagemErro = '';

  ngOnInit() {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/categorias`)
      .subscribe({
        next: (dados) => {
          this.categorias = dados;
          console.log('Categorias carregadas do banco:', this.categorias);
        },
        error: (erro) => {
          console.error('Erro ao buscar categorias:', erro);
          this.mensagemErro = 'Nao foi possivel carregar as categorias do banco.';
        }
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.produto.imagem = null;
      return;
    }

    if (!this.tiposImagemPermitidos.includes(file.type)) {
      this.mensagemErro = 'Use uma imagem JPG, JPEG, PNG ou WEBP.';
      input.value = '';
      this.produto.imagem = null;
      return;
    }

    if (file.size > this.tamanhoMaximoImagem) {
      this.mensagemErro = 'A imagem deve ter no maximo 5MB.';
      input.value = '';
      this.produto.imagem = null;
      return;
    }

    this.mensagemErro = '';
    this.produto.imagem = file;
  }

  adicionarProduto() {
    if (!this.produto.nome || !this.produto.id_categoria || !this.produto.preco || !this.produto.quantidade) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatorios.';
      return;
    }

    this.mensagemErro = '';

    this.http.post(this.apiUrlProdutos, this.montarFormDataProduto(this.produto)).subscribe({
      next: (resposta) => {
        console.log('Sucesso! Resposta do servidor:', resposta);
        this.mostrarPopupSucesso = true;
      },
      error: (erro) => {
        console.error('Erro ao salvar o produto:', erro);
        this.mensagemErro = 'Erro ao salvar o produto. O console tem mais detalhes.';
      }
    });
  }

  atualizarProduto(idProduto: number, produtoEditado: ProdutoForm) {
    if (!idProduto) {
      this.mensagemErro = 'Produto invalido para atualizacao.';
      return;
    }

    this.mensagemErro = '';

    this.http.put(`${this.apiUrlProdutos}/${idProduto}`, this.montarFormDataProduto(produtoEditado)).subscribe({
      next: (resposta) => {
        console.log('Produto atualizado:', resposta);
        this.mostrarPopupSucesso = true;
      },
      error: (erro) => {
        console.error('Erro ao atualizar produto:', erro);
        this.mensagemErro = 'Erro ao atualizar o produto. O console tem mais detalhes.';
      }
    });
  }

  private montarFormDataProduto(produto: ProdutoForm): FormData {
    const formData = new FormData();

    if (produto.nome !== undefined && produto.nome !== null) {
      formData.append('nome', produto.nome);
    }

    if (produto.descricao !== undefined && produto.descricao !== null) {
      formData.append('descricao', produto.descricao);
    }

    if (produto.id_categoria !== undefined && produto.id_categoria !== null && produto.id_categoria !== '') {
      formData.append('id_categoria', String(produto.id_categoria));
    }

    if (produto.preco !== undefined && produto.preco !== null) {
      formData.append('preco', String(produto.preco));
    }

    if (produto.quantidade !== undefined && produto.quantidade !== null) {
      formData.append('quantidade', String(produto.quantidade));
    }

    if (produto.imagem) {
      formData.append('imagem', produto.imagem);
    }

    return formData;
  }

  fecharPopup() {
    this.mostrarPopupSucesso = false;
    this.produto = { nome: '', id_categoria: '', preco: null, quantidade: null, imagem: null };
  }
}
