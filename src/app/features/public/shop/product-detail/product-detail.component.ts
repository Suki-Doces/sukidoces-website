import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Services
import { Title } from '@angular/platform-browser';
import { CartService } from 'src/app/core/services/cart.service';
import { Product, ProductService } from 'src/app/core/services/product.service';
import { NotificationService } from 'src/app/core/services/notification.service';

import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  isLoading: boolean = true;

  readonly defaultImage = `assets/images/produtos/default-product.svg`;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // I - Le o ID do produto a partir da URL
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('ID capturado da URL:', idParam);
    const id = idParam ? parseInt(idParam, 10) : null;

    if (!id) {
      // Se não houver ID válido, redireciona para a página de produtos
      this.router.navigate(['/produtos']);
      return;
    }

    // II - Busca o produto na API
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.isLoading = false;
        this.titleService.setTitle(`SukiDoces | ${this.product?.nome}`);
      },
      error: (err) => {
        console.error('Erro ao carregar produto:', err);
        this.router.navigate(['/produtos']); // Redireciona para a página de produtos em caso de erro
      }
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

  // IV - increment e decrementa a quantidade
  increment(): void {
    if (this.product && this.quantity < this.product.quantidade) {
      this.quantity++;
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // V - Adiciona o produto ao carrinho (ainda não implementado)
  addToCart(): void {
    if (this.product && this.product.quantidade > 0) {
      this.cartService.addToCart(this.product, this.quantity);
      this.notificationService.showSuccess(
        'Adicionado ao Carrinho', 
        `O item ${this.product.nome} já está aguardando você no carrinho.`
      );
    }
  }
}
