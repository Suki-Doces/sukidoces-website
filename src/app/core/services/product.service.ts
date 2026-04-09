import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments.development';

export interface Product {
  id_produto: number;
  nome: string;
  preco: number;
  imagem: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) { }

  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/mais-vendidos`);
  }

  getNewArrivals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/novos`);
  }
}
