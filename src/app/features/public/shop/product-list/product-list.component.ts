import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Services
import { ProductService, Product } from 'src/app/core/services/product.service';
import { CategoryService, Category } from 'src/app/core/services/category.service';

import { productImage } from 'src/environments/environments.development';

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

  readonly imageBaseUrl = `${productImage.baseUrl}`;
  readonly defaultImage = `${productImage.default}`;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // I - Busca as categorias para a barra de filtros (apenas uma vez)
    this.categoryService.getCategories().subscribe(cats =>{
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

  // III - Pede produtos ao serviço com base nos filtros atuais
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
}
