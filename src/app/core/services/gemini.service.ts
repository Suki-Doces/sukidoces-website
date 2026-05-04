import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`; // O seu novo endpoint

  // Mantemos o formato de histórico que o Google exige: { role: "user" | "model", parts: [{ text: "..." }] }
  private history: any[] = []; 

  constructor(private http: HttpClient) {}

  enviarMensagem(mensagem: string): Observable<any> {
    const payload = {
      message: mensagem,
      history: this.history
    };

    // Atualiza o histórico local com a mensagem do cliente antes de enviar
    this.history.push({ role: 'user', parts: [{ text: mensagem }] });

    return this.http.post<any>(this.apiUrl, payload);
  }

  // Método auxiliar para guardar a resposta do Bot no histórico para a próxima interação
  adicionarRespostaBotAoHistorico(resposta: string) {
    this.history.push({ role: 'model', parts: [{ text: resposta }] });
  }

  // Limpa o chat
  limparChat() {
    this.history = [];
  }
}