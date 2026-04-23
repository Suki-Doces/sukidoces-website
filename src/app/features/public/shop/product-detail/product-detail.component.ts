import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { Product, ProductService } from 'src/app/core/services/product.service';
import { productImage } from 'src/environments/environments.development';

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

  readonly imageBaseUrl = `${productImage.baseUrl}`;
  readonly defaultImage = `${productImage.default}`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
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
      },
      error: (err) => {
        console.error('Erro ao carregar produto:', err);
        this.router.navigate(['/produtos']); // Redireciona para a página de produtos em caso de erro
      }
    });
  }

  // III - increment e decrementa a quantidade
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

  // IV - Adiciona o produto ao carrinho (ainda não implementado)
  addToCart(): void {
    if (this.product && this.product.quantidade > 0) {
      this.cartService.addToCart(this.product, this.quantity);
      console.log(`Adicionando ${this.quantity} de ${this.product.nome} ao carrinho.`);
      // Opcional: Redirecionar direto para o carrinho
      //this.router.navigate(['/carrinho']);
    }
  }
}
