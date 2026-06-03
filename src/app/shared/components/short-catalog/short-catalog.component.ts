import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

// Serviços
import { ProductService, Product } from 'src/app/core/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-short-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './short-catalog.component.html',
  styleUrl: './short-catalog.component.css'
})
export class ShortCatalogComponent implements OnInit {
  activeTab: 'mais-vendidos' | 'novos' = 'mais-vendidos';

  bestSellers: Product[] = [];
  newArrivals: Product[] = [];

  isLoadingBest = true;
  isLoadingNew = true;

  // Objeto para rastrear a quantidade temporária de cada produto pelo ID
  quantidades: { [id_produto: number]: number } = {};

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // Carrega os Mais Vendidos
    this.productService.getProducts({ filtro: 'mais-vendidos' }).subscribe({
      next: (data) => {
        this.bestSellers = data.slice(0, 20); // Limita a 20 itens para não quebrar o layout "short"
        this.isLoadingBest = false;
      },
      error: (err) => {
        console.error('Erro ao carregar mais vendidos:', err);
        this.isLoadingBest = false;
      }
    });

    // Carrega os Lançamentos
    this.productService.getProducts({ filtro: 'novos' }).subscribe({
      next: (data) => {
        this.newArrivals = data.slice(0, 20);
        this.isLoadingNew = false;
      },
      error: (err) => {
        console.error('Erro ao carregar novos produtos:', err);
        this.isLoadingNew = false;
      }
    });
  }

  // ==========================================
  // FUNÇÕES DE CONTROLE DE QUANTIDADE (NOVAS)
  // ==========================================

  getQuantidade(id: number): number {
    return this.quantidades[id] || 1;
  }

  // Aumenta a quantidade respeitando o stock
  increaseQuantity(id: number, estoqueMaximo: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const current = this.getQuantidade(id);
    if (current < estoqueMaximo) {
      this.quantidades[id] = current + 1;
    }
  }

  decreaseQuantity(id: number, event: Event) {
    event.stopPropagation(); // Evita abrir a página do produto ao clicar no botão -
    const current = this.getQuantidade(id);
    if (current > 1) {
      this.quantidades[id] = current - 1;
    }
  }

  // ==========================================

  // Alterna as abas
  setActiveTab(tab: 'mais-vendidos' | 'novos'): void {
    this.activeTab = tab;
  }

  // Função que verifica se a data tem menos de 7 dias
  isRecente(dataCriacao?: string): boolean {
    // Se o produto não tiver data, não é novo
    if (!dataCriacao) return false;

    const dataProduto = new Date(dataCriacao);
    const hoje = new Date();

    // Calcula a diferença de tempo
    const diffTime = Math.abs(hoje.getTime() - dataProduto.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Retorna VERDADEIRO se for menor ou igual a 7 dias
    return diffDays <= 7;
  }

  // Monta a URL da imagem
  getProductImage(imageURL: string | null): string {
    if (!imageURL) return this.defaultImage;
    if (imageURL.startsWith('http')) return imageURL;
    return this.defaultImage;
  }

  // Fallback caso a imagem quebre
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

  // Função Funcional de Adicionar ao Carrinho Atualizada
  addToCart(event: Event, product: Product): void {
    event.preventDefault(); // Impede que o clique no botão redirecione para a página do produto
    event.stopPropagation(); // Impede que o clique "vaze" para o card

    // Puxa a quantidade que a pessoa escolheu na interface deste item específico
    const quantidadeSelecionada = this.getQuantidade(product.id_produto);

    // 1. Verifica quantos itens deste produto já estão no carrinho
    const currentQtyInCart = this.cartService.getItemQuantity(product.id_produto);

    // 2. Valida se a quantidade atual + a quantidade que ela quer levar ultrapassa o estoque disponível
    if (currentQtyInCart + quantidadeSelecionada > product.quantidade) {
      this.notificationService.showError(
        'Estoque Insuficiente',
        `Temos apenas ${product.quantidade} unidades disponíveis de ${product.nome}.`
      );
      return; // Interrompe a função aqui, não adiciona ao carrinho
    }

    // 3. Adiciona enviando o número real escolhido
    this.cartService.addToCart(product, quantidadeSelecionada);

    this.notificationService.showSuccess(
      'Adicionado ao Carrinho',
      `Adicionou ${quantidadeSelecionada}x ${product.nome} ao carrinho!`
    );

    // 4. Reseta o contador do seletor visual de volta para 1 para este doce
    this.quantidades[product.id_produto] = 1;
  }
}