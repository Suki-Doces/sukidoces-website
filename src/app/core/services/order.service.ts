import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // CORRIGIDO: era /pedidos/usuario/${userId} — rota inexistente no backend
  // Agora usa /usuario/pedidos que lê o ID do JWT token automaticamente
  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuario/pedidos`);
  }

  // Admin: lista todos os pedidos
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/admin/pedidos`);
  }

  // Admin: atualiza status de um pedido e notifica o cliente
  updateOrderStatus(orderId: number, novoStatus: string): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/admin/${orderId}/status`,
      { novoStatus }
    );
  }

  // Cliente: cancela pedido (regra: até 2 horas após a compra)
  cancelOrder(orderId: number): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/usuario/pedidos/${orderId}/cancelar`,
      {}
    );
  }

  // Cliente: cria novo pedido no checkout
  createOrder(produtos: any[], metodo_pagamento: string, codigo_cupom?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/pedidos`, {
      produtos,
      metodo_pagamento,
      ...(codigo_cupom && { codigo_cupom })
    });
  }
}
