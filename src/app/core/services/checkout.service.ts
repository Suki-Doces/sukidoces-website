import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UsuarioCheckout {
  nome: string;
  email?: string; // Opcional, pois no checkout costuma estar desabilitado/apenas leitura
  cpf: string;
  telefone?: string;
  enderecos?: any; // Alterado para 'any' para aceitar o payload complexo (create/update) do endereço
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) { }

  /**
   * AUTO-SAVE: Atualiza o perfil e o endereço do cliente em background.
   * CORREÇÃO: Agora envia o objeto 'dados' completo, garantindo que 
   * CPF, Rua, Número, CEP, etc., sejam guardados na base de dados.
   */
  autoSalvarUsuario(dados: UsuarioCheckout): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, dados);
  }

  /**
   * SEGURANÇA: Prepara os dados do formulário para envio seguro.
   * Remove dados reais de cartão de crédito (CVV e Numeração completa)
   * para evitar logs acidentais ou vazamentos (Compliance PCI).
   */
  sanitizePaymentData(rawFormData: any): any {
    const safeData = { ...rawFormData };

    if (safeData.metodo_pagamento === 'cartao') {
      // Mascara o número mantendo só os 4 últimos dígitos
      if (safeData.card_number) {
        const last4 = safeData.card_number.toString().slice(-4);
        safeData.card_number = `**** **** **** ${last4}`;
      }
      // O CVV nunca deve transitar em texto limpo
      delete safeData.card_cvv;
    }

    return safeData;
  }
}