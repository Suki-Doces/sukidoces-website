import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

// Servicos
import { CartService, CartItem } from 'src/app/core/services/cart.service';

import { productImage } from 'src/environments/environments.development';
import { MarketingSectionComponent } from 'src/app/shared/components/contoured-section/marketing-section/marketing-section.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MarketingSectionComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  readonly imageBaseUrl = `${productImage.baseUrl}`;
  readonly defaultImage = `${productImage.default}`;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Inscreve-se para receber atualizações do carrinho
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getTotal();
    });
  }

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id_produto, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id_produto, item.quantity - 1);
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }
}
