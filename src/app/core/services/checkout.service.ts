import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UsuarioCheckout {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) {}

  autoSalvarUsuario(dados: UsuarioCheckout): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, {
      nome: dados.nome,
      telefone: dados.telefone
    });
  }
}
