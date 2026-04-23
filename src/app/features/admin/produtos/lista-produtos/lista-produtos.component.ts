import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lista-produtos.component.html',
  styleUrls: ['./lista-produtos.component.css']
})
export class ListaProdutosComponent implements OnInit {
  // Categorias simuladas (Mock)
  categorias = [
    { id_categoria: 1, nome: 'Chocolates' },
    { id_categoria: 2, nome: 'Bebidas' },
    { id_categoria: 3, nome: 'Salgadinhos' },
    { id_categoria: 4, nome: 'Sorvetes' }
  ];

  // Objeto para guardar os dados do formulário
  produto = {
    nome: '',
    id_categoria: '',
    preco: null,
    quantidade: null,
    imagem: null as File | null
  };

  // Controles de interface
  mostrarPopupSucesso = false;
  mensagemErro = '';

  ngOnInit() {
    // Inicializações futuras se necessário
  }

  // Captura o arquivo de imagem selecionado
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.produto.imagem = file;
    }
  }

  // Função disparada ao clicar em "Adicionar Produto"
  adicionarProduto() {
    // Validação básica
    if (!this.produto.nome || !this.produto.id_categoria || !this.produto.preco || !this.produto.quantidade) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.mensagemErro = ''; // Limpa os erros

    // FUTURO: Aqui você usará FormData para enviar a imagem e os dados para o Node.js/Prisma
    /*
      const formData = new FormData();
      formData.append('nome', this.produto.nome);
      formData.append('id_categoria', this.produto.id_categoria);
      // ...
      this.http.post('http://localhost:3000/api/admin/produtos', formData).subscribe(...)
    */

    console.log('Produto a ser salvo:', this.produto);

    // Simula o salvamento com sucesso e abre o Pop-up
    this.mostrarPopupSucesso = true;
  }

  // Função para fechar o pop-up e limpar o formulário
  fecharPopup() {
    this.mostrarPopupSucesso = false;
    this.produto = { nome: '', id_categoria: '', preco: null, quantidade: null, imagem: null };
  }
}