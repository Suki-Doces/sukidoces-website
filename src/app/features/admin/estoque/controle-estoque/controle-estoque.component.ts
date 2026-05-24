import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-controle-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './controle-estoque.component.html',
  styleUrls: ['./controle-estoque.component.css']
})
export class ControleEstoqueComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly tamanhoMaximoImagem = 5 * 1024 * 1024;
  private readonly tiposImagemPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

  produtos: any[] = [];
  isEditModalOpen = false;
  produtoEditado: any = {};
  novaFotoSelecionada: File | null = null;

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  ngOnInit() {
    this.carregarProdutos();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.novaFotoSelecionada = null;
      return;
    }

    if (!this.tiposImagemPermitidos.includes(file.type)) {
      alert('Use uma imagem JPG, JPEG, PNG ou WEBP.');
      input.value = '';
      this.novaFotoSelecionada = null;
      return;
    }

    if (file.size > this.tamanhoMaximoImagem) {
      alert('A imagem deve ter no maximo 5MB.');
      input.value = '';
      this.novaFotoSelecionada = null;
      return;
    }

    this.novaFotoSelecionada = file;
  }

  carregarProdutos() {
    this.http.get<any[]>(`${environment.apiUrl}/produtos`).subscribe({
      next: (dados) => {
        this.produtos = dados;
      },
      error: (erro) => console.error('Erro ao buscar produtos do estoque:', erro)
    });
  }

  getProductImage(imageURL: string | null): string {
    if (!imageURL) {
      return this.defaultImage;
    }

    if (imageURL.startsWith('http')) {
      return imageURL;
    }

    return this.defaultImage;
  }

  abrirModalEditar(produto: any) {
    this.produtoEditado = { ...produto };
    this.novaFotoSelecionada = null;
    this.isEditModalOpen = true;
  }

  fecharModal() {
    this.isEditModalOpen = false;
    this.novaFotoSelecionada = null;
  }

  salvarEdicao() {
    const url = `${environment.apiUrl}/produtos/${this.produtoEditado.id_produto}`;

    const formData = new FormData();
    formData.append('nome', this.produtoEditado.nome ?? '');
    formData.append('descricao', this.produtoEditado.descricao ?? '');
    formData.append('quantidade', String(Number(this.produtoEditado.quantidade)));
    formData.append('preco', String(Number(this.produtoEditado.preco)));

    if (this.novaFotoSelecionada) {
      formData.append('imagem', this.novaFotoSelecionada);
    }

    this.http.put(url, formData).subscribe({
      next: () => {
        this.carregarProdutos();
        this.fecharModal();
      },
      error: (erro) => {
        console.error('Erro ao atualizar produto:', erro);
        alert('Erro ao guardar alteracoes.');
      }
    });
  }

  deletarProduto(id: number) {
    if (confirm('Tem a certeza que deseja remover este produto do estoque?')) {
      this.http.delete(`${environment.apiUrl}/produtos/${id}`).subscribe({
        next: () => this.carregarProdutos(),
        error: (erro) => {
          console.error('Erro ao deletar:', erro);
          alert('Nao foi possivel remover o produto.');
        }
      });
    }
  }
}
