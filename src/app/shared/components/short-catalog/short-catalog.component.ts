import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

// Serviços
import { ProductService, Product } from 'src/app/core/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { environment } from 'src/environments/environments';

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
        this.bestSellers = data.slice(0, 8); // Limita a 8 itens para não quebrar o layout "short"
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
        this.newArrivals = data.slice(0, 8);
        this.isLoadingNew = false;
      },
      error: (err) => {
        console.error('Erro ao carregar novos produtos:', err);
        this.isLoadingNew = false;
      }
    });
  }

  // Alterna as abas
  setActiveTab(tab: 'mais-vendidos' | 'novos'): void {
    this.activeTab = tab;
  }

  // Monta a URL da imagem[cite: 13]
  getProductImage(imageURL: string | null): string {
    if (!imageURL) return this.defaultImage;
    if (imageURL.startsWith('http')) return imageURL;
    return `${environment.productImgUrl}${imageURL}`;
  }

  // Fallback caso a imagem quebre
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

  // Função Funcional de Adicionar ao Carrinho
  addToCart(event: Event, product: Product): void {
    event.preventDefault(); // Impede que o clique no botão redirecione para a página do produto
    event.stopPropagation(); // Impede que o clique "vaze" para o card

    this.cartService.addToCart(product, 1);
    this.notificationService.showSuccess(
        'Adicionado ao Carrinho', 
        `O item ${product.nome} já está aguardando você no carrinho.`
      );
  }
}