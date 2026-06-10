import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuario/pedidos`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/admin/pedidos`);
  }

  updateOrderStatus(orderId: number, novoStatus: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/admin/${orderId}/status`, { novoStatus });
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/usuario/pedidos/${orderId}/cancelar`, {});
  }

  createOrder(produtos: any[], metodo_pagamento: string, codigo_cupom?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/pedidos`, {
      produtos,
      metodo_pagamento,
      ...(codigo_cupom && { codigo_cupom })
    });
  }

  // 🪄 Rota correta e alinhada com o servidor
  retryPayment(orderId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/pedidos/${orderId}/pagar`, {});
  }
}