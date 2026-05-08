import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // CORRIGIDO: era /pedidos/usuario/${userId} — rota que não existia no backend
  // Agora usa /usuario/pedidos que lê o ID do token JWT (mais seguro)
  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuario/pedidos`);
  }

  // Para o admin listar todos os pedidos
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/admin/pedidos`);
  }

  // Para o admin atualizar status de um pedido
  updateOrderStatus(orderId: number, novoStatus: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/admin/${orderId}/status`, { novoStatus });
  }

  // Criar pedido (cliente)
  createOrder(produtos: any[], metodo_pagamento: string): Observable<any> {
    return this.http.post(`${this.API_URL}/admin/pedidos`, { produtos, metodo_pagamento });
  }
}