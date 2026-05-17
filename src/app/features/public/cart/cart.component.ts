import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

// Servicos
import { CartService, CartItem } from 'src/app/core/services/cart.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  readonly defaultImage = `assets/images/produtos/default-product.svg`;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getTotal();
    });
  }

  //Retorna a URL completa da imagem do produto ou a imagem padrão se não houver
  getProductImage(imageURL: string | null): string {
    if (!imageURL) {
      return this.defaultImage;
    }

    if (imageURL.startsWith('http')) {
      return imageURL; // URL completa já fornecida pela API
    }

    return `${environment.productImgUrl}${imageURL}`;
  }

  increment(item: CartItem): void {
    if (item.id && item.quantity < item.product.quantidade) {
      this.cartService.updateQuantity(item.id, item.quantity + 1);
    }
  }

  decrement(item: CartItem): void {
    if (item.id && item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

  removeItem(itemId: number | undefined): void {
    if (itemId) {
      this.cartService.removeFromCart(itemId);
    }
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  goToCheckout(): void {
    if (this.authService.isLoggedIn()) {
      // Se estiver logado, vai direto para o checkout
      this.router.navigate(['/checkout']);
    } else {
      // Se NÃO estiver logado, mostra o toast e manda para o login
      this.notificationService.showError(
        'Atenção',
        'Por favor, faça o login ou cadastre-se para finalizar o seu pedido.'
      );
      this.router.navigate(['/login']);
    }
  }
}
