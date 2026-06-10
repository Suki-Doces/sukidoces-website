import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { concatMap, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Product } from './product.service';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service'; // <-- Importado o AuthService

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  frete: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/carrinho`;
  private guestCartKey = 'suki_guest_cart'; // Chave para o LocalStorage

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  // 🪄 PROBLEMA 1 RESOLVIDO: Estado global para os totais do carrinho incluindo frete
  private cartSummarySubject = new BehaviorSubject<CartSummary>({ subtotal: 0, frete: 0, total: 0 });
  cartSummary$ = this.cartSummarySubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadCart(); // Mudamos para uma função genérica de carregamento
  }

  // ==========================================
  // CARREGAMENTO DE DADOS (Híbrido)
  // ==========================================
  loadCart(): void {
    if (this.authService.isLoggedIn()) {
      this.loadCartFromServer();
    } else {
      this.loadCartFromLocalStorage();
    }
  }

  private loadCartFromServer(): void {
    // 🪄 PROBLEMA 1 RESOLVIDO: Mapeia também os totais enviados pelo Node.js
    this.http.get<{ cartItems: any[], subtotal: number, frete: number, total: number }>(this.apiUrl).subscribe({
      next: (response) => {
        const items: CartItem[] = response.cartItems.map(item => ({
          id: item.id,
          product: item.produto,
          quantity: item.quantidade
        }));
        this.cartSubject.next(items);

        // Puxa o cálculo financeiro blindado que veio do Back-end
        this.cartSummarySubject.next({
          subtotal: response.subtotal || 0,
          frete: response.frete || 0,
          total: response.total || 0
        });
      },
      error: (err) => console.error('Erro ao carregar carrinho:', err)
    });
  }

  private loadCartFromLocalStorage(): void {
    const cartData = localStorage.getItem(this.guestCartKey);
    const items: CartItem[] = cartData ? JSON.parse(cartData) : [];
    this.cartSubject.next(items);
    this.updateLocalSummary(items);
  }

  private saveCartToLocalStorage(items: CartItem[]): void {
    localStorage.setItem(this.guestCartKey, JSON.stringify(items));
    this.cartSubject.next(items); // Atualiza os componentes que estão escutando o carrinho em tempo real
    this.updateLocalSummary(items);
  }

  // 🪄 PROBLEMA 1 RESOLVIDO: Espelha a regra de frete do Back-end para usuários deslogados
  private updateLocalSummary(items: CartItem[]): void {
    const subtotal = items.reduce((sum, item) => sum + (item.product.preco * item.quantity), 0);
    let frete = 0;
    
    if (subtotal > 0 && subtotal < 50) {
      frete = 8.90; // Regra de negócio (frete aplicado se menor que R$ 50)
    }

    const total = subtotal + frete;
    this.cartSummarySubject.next({ subtotal, frete, total });
  }

  // ==========================================
  // AÇÕES DO CARRINHO (Híbrido)
  // ==========================================
  addToCart(product: Product, quantity: number = 1): void {
    if (this.authService.isLoggedIn()) {
      // USUÁRIO LOGADO: Vai para a API
      const body = { id_produto: product.id_produto, quantidade: quantity };
      this.http.post(`${this.apiUrl}/add`, body).subscribe({
        next: () => this.loadCartFromServer(),
        error: (err) => console.error('Erro ao adicionar:', err)
      });
    } else {
      // USUÁRIO DESLOGADO: Vai para o LocalStorage
      const items = this.cartSubject.value;
      const existingItem = items.find(item => item.product.id_produto === product.id_produto);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Gera um ID falso baseado na data apenas para o item funcionar no layout temporariamente
        items.push({ id: Date.now(), product, quantity });
      }
      this.saveCartToLocalStorage(items);
    }
  }

  removeFromCart(itemId: number) {
    if (this.authService.isLoggedIn()) {
      if (!itemId) return;
      this.http.delete(`${this.apiUrl}/${itemId}`).subscribe({
        next: () => this.loadCartFromServer(),
        error: (err) => console.error('Erro ao remover:', err)
      });
    } else {
      const items = this.cartSubject.value.filter(item => item.id !== itemId);
      this.saveCartToLocalStorage(items);
    }
  }

  updateQuantity(itemId: number, quantity: number) {
    if (this.authService.isLoggedIn()) {
      if (!itemId || quantity <= 0) return;
      this.http.put(`${this.apiUrl}/${itemId}`, { quantidade: quantity }).subscribe({
        next: () => this.loadCartFromServer(),
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      if (!itemId || quantity <= 0) return;
      const items = this.cartSubject.value;
      const item = items.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        this.saveCartToLocalStorage(items);
      }
    }
  }

  // ==========================================
  // VALIDAÇÕES E TOTAIS
  // ==========================================
  getItemQuantity(productId: number): number {
    const items = this.cartSubject.value;
    const item = items.find(i => i.product.id_produto === productId);
    return item ? item.quantity : 0;
  }

  // 🪄 PROBLEMA 1 RESOLVIDO: O front-end agora busca o total consolidado e exato
  getTotal(): number {
    return this.cartSummarySubject.value.total;
  }

  clearCart() {
    if (this.authService.isLoggedIn()) {
      this.http.delete(this.apiUrl).subscribe({
        next: () => {
          this.cartSubject.next([]);
          this.cartSummarySubject.next({ subtotal: 0, frete: 0, total: 0 });
        },
        error: (err) => console.error('Erro ao esvaziar:', err)
      });
    } else {
      localStorage.removeItem(this.guestCartKey);
      this.cartSubject.next([]);
      this.cartSummarySubject.next({ subtotal: 0, frete: 0, total: 0 });
    }
  }

  // ==========================================
  // SINCRONIZAÇÃO APÓS LOGIN (Sequencial e Blindada)
  // ==========================================
  syncGuestCartToDatabase(): void {
    const cartData = localStorage.getItem(this.guestCartKey);
    const items: CartItem[] = cartData ? JSON.parse(cartData) : [];

    if (items.length > 0) {
      from(items).pipe(
        concatMap(item => {
          const body = { id_produto: item.product.id_produto, quantidade: item.quantity };
          return this.http.post(`${this.apiUrl}/add`, body);
        }),
        finalize(() => {
          // O 'finalize' é o nosso salva-vidas. Ele garante que a lista oficial 
          // será recarregada, quer as requisições tenham tido sucesso ou erro.
          this.loadCartFromServer();
        })
      ).subscribe({
        next: () => {
          // Item processado com sucesso silenciosamente
        },
        error: (err) => {
          console.error('Aviso ao sincronizar um dos itens do carrinho:', err);
        },
        complete: () => {
          // 🪄 PROBLEMA 3 RESOLVIDO: O carrinho do visitante SÓ é apagado 
          // quando o servidor processou a lista toda e não houve quebra na internet.
          localStorage.removeItem(this.guestCartKey);
        }
      });

    } else {
      // Se não havia nada no localStorage, apenas carrega o que já estava na conta
      this.loadCartFromServer();
    }
  }
}