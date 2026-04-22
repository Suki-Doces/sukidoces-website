import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Carrega o carrinho do localStorage ou retorna um array vazio
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  constructor() { }

  // Recupera o carrinho salvo no localStorage
  private loadCart(): CartItem[] {
    const saved = localStorage.getItem('suki_cart');
    return saved ? JSON.parse(saved) : [];
  }

  // Salva o carrinho no localStorage e atualiza o BehaviorSubject
  private saveCart(items: CartItem[]): void {
    localStorage.setItem('suki_cart', JSON.stringify(items));
    this.cartSubject.next(items);
  }

  // Adiciona um produto ao carrinho ou atualiza a quantidade se já existir
  addToCart(product: Product, quantity: number = 1): void {
    const items = this.cartSubject.value;
    const existingItem = items.find(item => item.product.id_produto === product.id_produto);

    if (existingItem) {

      const newQty = existingItem.quantity + quantity;
      existingItem.quantity = newQty > product.quantidade ? product.quantidade : newQty; // Limita à quantidade disponível
    } else {
      items.push({ product, quantity });
    }
    this.saveCart(items);
  }

  removeFromCart(productId: number) {
    const items = this.cartSubject.value.filter(item => item.product.id_produto !== productId);
    this.saveCart(items);
  }

  // Ação: Atualizar Quantidade
  updateQuantity(productId: number, quantity: number) {
    const items = this.cartSubject.value;
    const item = items.find(i => i.product.id_produto === productId);

    if (item && quantity > 0 && quantity <= item.product.quantidade) {
      item.quantity = quantity;
      this.saveCart(items);
    }
  }

  // Calcula o Total R$
  getTotal(): number {
    return this.cartSubject.value.reduce((total, item) => total + (item.product.preco * item.quantity), 0);
  }

  clearCart() {
    this.saveCart([]);
  }
}
