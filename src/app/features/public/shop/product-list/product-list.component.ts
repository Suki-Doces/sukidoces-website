import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Services
import { ProductService, Product } from 'src/app/core/services/product.service';
import { CategoryService, Category } from 'src/app/core/services/category.service';
import { CartService } from 'src/app/core/services/cart.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  // Objeto para rastrear a quantidade temporária de cada produto pelo ID
  quantidades: { [id_produto: number]: number } = {};
  categories: Category[] = []

  // Estado atual dos filtros na URL
  currentQuery: string | null = null;
  currentCategory: number | null = null;
  currentFilter: string | null = null;
  isLoading: boolean = true;

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // I - Busca as categorias para a barra de filtros (apenas uma vez)
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    // II - Escuta as mudanças nos parâmetros da URL para atualizar os produtos
    this.route.queryParams.subscribe(params => {
      this.currentQuery = params['query'] || null;
      this.currentCategory = params['categoria'] ? parseInt(params['categoria'], 10) : null;
      this.currentFilter = params['filtro'] || null;

      this.loadProducts();
    });
  }

  // ==========================================
  // FUNÇÕES DE CONTROLO DE QUANTIDADE (NOVAS)
  // ==========================================

  // Retorna a quantidade atual no seletor (ou 1 se não tiver mexido)
  getQuantidade(id: number): number {
    return this.quantidades[id] || 1;
  }

  increaseQuantity(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getQuantidade(id);
    this.quantidades[id] = current + 1;
  }

  decreaseQuantity(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getQuantidade(id);
    if (current > 1) {
      this.quantidades[id] = current - 1;
    }
  }

  // ==========================================

  // III - Retorna a URL completa da imagem do produto ou a imagem padrão se não houver
  getProductImage(imageURL: string | null): string {
    if (!imageURL) {
      return this.defaultImage;
    }

    if (imageURL.startsWith('http')) {
      return imageURL; // URL completa já fornecida pela API
    }

    return this.defaultImage;
  }

  // IV - Pede produtos ao serviço com base nos filtros atuais
  loadProducts(): void {
    this.isLoading = true;

    const filters: any = {
      query: this.currentQuery || undefined,
      categoria: this.currentCategory || undefined,
      filtro: this.currentFilter || undefined
    };

    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.isLoading = false;
        this.products = []; // Limpa a lista em caso de erro para evitar mostrar dados antigos
      }
    })
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

  trackByProductId(index: number, product: Product): number | string {
    return product.id_produto;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id_categoria;
  }

  // ATUALIZADO: Agora considera a quantidade selecionada pelo cliente!
  addToCart(event: Event, product: Product): void {
    event.preventDefault();  // Evita comportamento padrão 
    event.stopPropagation(); // Evita que o clique vaze para outros elementos

    // Lê a quantidade que o cliente selecionou no card
    const quantidadeSelecionada = this.getQuantidade(product.id_produto);

    // 1. Verifica quantos itens deste produto já estão no carrinho
    const currentQtyInCart = this.cartService.getItemQuantity(product.id_produto);

    // 2. Valida contra o estoque (Carrinho + Selecionado agora)
    if (currentQtyInCart + quantidadeSelecionada > product.quantidade) {
      this.notificationService.showError(
        'Estoque Insuficiente',
        `Temos apenas ${product.quantidade} unidades disponíveis de ${product.nome}.`
      );
      return;
    }

    // 3. Adiciona ao carrinho com a quantidade escolhida!
    this.cartService.addToCart(product, quantidadeSelecionada);

    // 4. Notifica o sucesso pluralizando o texto
    this.notificationService.showSuccess(
      'Adicionado ao Carrinho',
      `Adicionou ${quantidadeSelecionada}x ${product.nome} ao carrinho!`
    );

    // 5. Opcional: Reinicia o contador para 1 no seletor da interface
    this.quantidades[product.id_produto] = 1;
  }
}