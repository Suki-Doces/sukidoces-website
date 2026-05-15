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

  // CORRIGIDO: era /clientes/auto-save — rota que não existe no backend
  // Agora salva corretamente no perfil do usuário via PUT /usuario/perfil
  autoSalvarUsuario(dados: UsuarioCheckout): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, {
      nome: dados.nome,
      telefone: dados.telefone
    });
  }
}
