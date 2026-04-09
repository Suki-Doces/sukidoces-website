import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments.development';

// Definimos a interface baseada na sua tabela 'categorias' do banco de dados
export interface Category {
  id_categoria: number;
  nome: string;
  descricao?: string;
}

@Injectable({
  providedIn: 'root' // Torna o serviço disponível em toda a aplicação
})
export class CategoryService {
  // O endereço da sua futura API em Node.js
  private readonly API_URL = '${environment.apiUrl}/categorias';

  constructor(private http: HttpClient) {}

  /**
   * Busca a lista de categorias.
   * @param limit Opcional. Limita o número de resultados (usado no Footer).
   */
  getCategories(limit?: number): Observable<Category[]> {
    let params = new HttpParams();
    
    // Se passarmos um limite (ex: 7 no footer), adiciona ?limit=7 na URL
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<Category[]>(this.API_URL, { params });
  }

  /**
   * Busca uma categoria específica pelo ID.
   */
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/${id}`);
  }

  /**
   * Cria uma nova categoria (Área de Administração)
   */
  createCategory(categoryData: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.API_URL, categoryData);
  }

  /**
   * Atualiza uma categoria existente (Área de Administração)
   */
  updateCategory(id: number, categoryData: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.API_URL}/${id}`, categoryData);
  }

  /**
   * Elimina uma categoria (Área de Administração)
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}