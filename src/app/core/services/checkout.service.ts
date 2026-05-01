import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

export interface UsuarioCheckout {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  endereco?: string; // Novo campo adicionado
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/clientes`; 

  constructor(private http: HttpClient) {}

  autoSalvarUsuario(dados: UsuarioCheckout): Observable<any> {
    return this.http.post(`${this.apiUrl}/auto-save`, dados);
  }
}