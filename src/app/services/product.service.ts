import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria: { nome: string };
}

@Injectable({
  providedIn: 'root',
})
// -> REAL API
// export class ProductService {
//   // URL da API                     :PORTA/diretório
//   private apiUrl = 'http://localhost:3000/api/produtos';

//   constructor(private http: HttpClient) {}

//   getProdutos(): Observable<Produto[]> {
//     return this.http.get<Produto[]>(this.apiUrl);
//   }

//   getProdutoPorId(id: number): Observable<Produto> {
//     return this.http.get<Produto>(`${this.apiUrl}/${id}`);
//   }
// }

// -> TEST API
export class ProdutoService {
  // Aponta para o ficheiro estático
  private jsonUrl = 'assets/db.json';

  constructor(private http: HttpClient) {}

  getProdutos(): Observable<any[]> {
    // Faz o GET e extrai apenas o array "produtos" do JSON
    return this.http.get<any>(this.jsonUrl).pipe(map((data) => data.produtos));
  }
}
