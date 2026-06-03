import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Product {
  id_produto: number;
  nome: string;
  preco: number;
  imagem: string | null;
  nome_categoria: string;
  descricao: string;
  quantidade: number;
  data_criacao?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) {}

  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/mais-vendidos`);
  }

  getNewArrivals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/novos`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  // ADICIONADO: minPreco e maxPreco para filtro por faixa de preço
  getProducts(filters?: {
    query?: string;
    categoria?: number;
    filtro?: string;
    minPreco?: number;   // NOVO
    maxPreco?: number;   // NOVO
  }): Observable<Product[]> {
    let params = new HttpParams();

    if (filters?.query)     params = params.set('query', filters.query);
    if (filters?.categoria) params = params.set('categoria', filters.categoria.toString());
    if (filters?.filtro)    params = params.set('filtro', filters.filtro);

    // ADICIONADO: envia os filtros de preço para o backend
    if (filters?.minPreco !== undefined) params = params.set('minPreco', filters.minPreco.toString());
    if (filters?.maxPreco !== undefined) params = params.set('maxPreco', filters.maxPreco.toString());

    return this.http.get<Product[]>(this.API_URL, { params });
  }
}
