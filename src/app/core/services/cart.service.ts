import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from './product.service';
import { environment } from 'src/environments/environments';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/carrinho`; 
  
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadCartFromServer();
  }

  loadCartFromServer(): void {
    this.http.get<{ cartItems: any[], total: number }>(this.apiUrl).subscribe({
      next: (response) => {
        const items: CartItem[] = response.cartItems.map(item => ({
          id: item.id,
          product: item.produto,
          quantity: item.quantidade
        }));
        this.cartSubject.next(items);
      },
      error: (err) => console.error('Erro ao carregar carrinho:', err)
    });
  }

  addToCart(product: Product, quantity: number = 1): void {
    
    const body = {
      id_produto: product.id_produto, 
      quantidade: quantity
    };
  
    console.log('Enviando para a API:', body); 
  
    this.http.post(`${this.apiUrl}/add`, body).subscribe({
      next: () => this.loadCartFromServer(),
      error: (err) => console.error('Erro ao adicionar:', err)
    });
  }

  removeFromCart(itemId: number) {
    if (!itemId) return;
    this.http.delete(`${this.apiUrl}/${itemId}`).subscribe({
      next: () => this.loadCartFromServer(),
      error: (err) => console.error('Erro ao remover:', err)
    });
  }

  updateQuantity(itemId: number, quantity: number) {
    if (!itemId || quantity <= 0) return;
    this.http.put(`${this.apiUrl}/${itemId}`, { quantidade: quantity }).subscribe({
      next: () => this.loadCartFromServer(),
      error: (err) => console.error('Erro ao atualizar:', err)
    });
  }

  getTotal(): number {
    return this.cartSubject.value.reduce((total, item) => total + (item.product.preco * item.quantity), 0);
  }

  clearCart() {
    this.http.delete(this.apiUrl).subscribe({
      next: () => this.cartSubject.next([]),
      error: (err) => console.error('Erro ao esvaziar:', err)
    });
  }
}