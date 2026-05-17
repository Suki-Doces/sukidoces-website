import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-controle-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './controle-estoque.component.html',
  styleUrls: ['./controle-estoque.component.css']
})
export class ControleEstoqueComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/estoque`;
  
  produtos: any[] = [];
  
  // Variáveis para controlar o Modal de Edição
  isEditModalOpen = false;
  produtoEditado: any = {};

  // 1. Variable (Para guardar a foto)
  novaFotoSelecionada: File | null = null;

  ngOnInit() {
    this.carregarProdutos();
  }

  // 2. Função para receber a foto do HTML
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.novaFotoSelecionada = file;
    }
  }

  carregarProdutos() {
    // Busca os produtos na mesma rota que usamos antes
    this.http.get<any[]>(`${environment.apiUrl}/produtos`).subscribe({
      next: (dados) => {
        this.produtos = dados;
      },
      error: (erro) => console.error('Erro ao buscar produtos do estoque:', erro)
    });
  }

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  // Método que monta a URL da imagem usando a API
  getProductImage(imageURL: string | null): string {
    if (!imageURL) {
      return this.defaultImage;
    }

    // Se já vier uma URL completa da API, retorna ela mesma
    if (imageURL.startsWith('http')) {
      return imageURL;
    }

    // Concatena a URL da API (que está no environment) com o nome da imagem
    return `${environment.productImgUrl}${imageURL}`;
  }

  abrirModalEditar(produto: any) {
    // Fazemos uma cópia do produto para não alterar a tabela antes de guardar
    this.produtoEditado = { ...produto };
    this.isEditModalOpen = true;
  }

  fecharModal() {
    this.isEditModalOpen = false;
  }

  salvarEdicao() {
    const url = `${environment.apiUrl}/produtos/${this.produtoEditado.id_produto}`;
    
    // Prepara os dados (garantindo que quantidade e preço são números)
    const payload = {
      nome: this.produtoEditado.nome,
      descricao: this.produtoEditado.descricao, // <- Nova opção pedida!
      quantidade: Number(this.produtoEditado.quantidade),
      preco: Number(this.produtoEditado.preco)
    };

    this.http.put(url, payload).subscribe({
      next: () => {
        this.carregarProdutos(); // Recarrega a tabela atualizada
        this.fecharModal();      // Fecha o Pop-up
      },
      error: (erro) => {
        console.error('Erro ao atualizar produto:', erro);
        alert('Erro ao guardar alterações.');
      }
    });
  }

  deletarProduto(id: number) {
    if (confirm('Tem a certeza que deseja remover este produto do estoque?')) {
      this.http.delete(`${environment.apiUrl}/produtos/${id}`).subscribe({
        next: () => this.carregarProdutos(),
        error: (erro) => {
          console.error('Erro ao deletar:', erro);
          alert('Não foi possível remover o produto.');
        }
      });
    }
  }
}
