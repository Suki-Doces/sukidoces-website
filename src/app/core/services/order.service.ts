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
    return this.http.patch(`${this.API_URL}/pedidos/${orderId}/status`, { status: novoStatus });
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/usuario/pedidos/${orderId}/cancelar`, {});
  }

  /**
   * O NestJS exige o cabecalho Idempotency-Key: a mesma chave + mesmo corpo devolve o pedido
   * original em vez de cobrar duas vezes (ex.: clique duplo ou reenvio apos queda de rede).
   */
  createOrder(
    produtos: any[],
    metodo_pagamento: string,
    codigo_cupom?: string,
    idempotencyKey: string = OrderService.newIdempotencyKey(),
    enderecoEntrega?: { estado: string; cidade: string }
  ): Observable<any> {
    // O servidor calcula o frete a partir do destino (a mesma regra mostrada no checkout) e o grava no pedido.
    return this.http.post(
      `${this.API_URL}/pedidos`,
      {
        produtos,
        metodo_pagamento,
        ...(codigo_cupom && { codigo_cupom }),
        ...(enderecoEntrega && { endereco_entrega: enderecoEntrega })
      },
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );
  }

  static newIdempotencyKey(): string {
    return globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  // 🪄 Rota correta e alinhada com o servidor
  retryPayment(orderId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/pedidos/${orderId}/pagar`, {});
  }
}