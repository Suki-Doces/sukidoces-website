import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Services
import { ProductService, Product } from 'src/app/core/services/product.service';
import { CategoryService, Category } from 'src/app/core/services/category.service';

import { environment } from 'src/environments/environments';

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
    private categoryService: CategoryService
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
  // III - Retorna a URL completa da imagem do produto ou a imagem padrão se não houver
  getProductImage(imageURL: string | null): string {
    if (!imageURL) {
      return this.defaultImage;
    }

    if (imageURL.startsWith('http')) {
      return imageURL; // URL completa já fornecida pela API
    }

    return `${environment.productImgUrl}${imageURL}`;
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

  /**
   * Função para capturar a ação de "Adicionar ao Carrinho"
   */
  addToCart(product: Product): void {
    // Exemplo:
    // this.cartService.addToCart(product);
    console.log('Adicionado ao carrinho:', product.nome);

    // Opcional: Aqui você pode disparar um Toast / Snackbar de sucesso
  }
}
