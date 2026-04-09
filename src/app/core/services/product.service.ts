import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments.development';

export interface Product {
  id_produto: number;
  nome: string;
  preco: number;
  imagem: string | null;
  nome_categoria: string;
  descricao: string;
  quantidade: number;
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
  // Busca produto pelo ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  // Filtros para busca de produtos
  getProducts(filters?: { query?: string; categoria?: number; filtro?: string }): Observable<Product[]> {
    let params = new HttpParams();

    if (filters?.query) {
      params = params.set('query', filters.query);
    }
    if (filters?.categoria) {
      params = params.set('categoria', filters.categoria.toString());
    }
    if (filters?.filtro) {
      params = params.set('filtro', filters.filtro);
    }

    return this.http.get<Product[]>(this.API_URL, { params });
  }
}
