import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Ajuste a rota base de acordo com a sua API de pedidos
  private readonly API_URL = `${environment.apiUrl}/pedidos`; 

  constructor(private http: HttpClient) { }

  getUserOrders(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuario/${userId}`);
  }
}