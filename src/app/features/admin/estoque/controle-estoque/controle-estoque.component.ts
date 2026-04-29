import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environments.development';

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
    this.http.get<any[]>('http://localhost:3000/suki-doces/produtos').subscribe({
      next: (dados) => {
        this.produtos = dados;
      },
      error: (erro) => console.error('Erro ao buscar produtos do estoque:', erro)
    });
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
    const url = `http://localhost:3000/suki-doces/produtos/${this.produtoEditado.id_produto}`;
    
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
      this.http.delete(`http://localhost:3000/suki-doces/produtos/${id}`).subscribe({
        next: () => this.carregarProdutos(),
        error: (erro) => {
          console.error('Erro ao deletar:', erro);
          alert('Não foi possível remover o produto.');
        }
      });
    }
  }
}
