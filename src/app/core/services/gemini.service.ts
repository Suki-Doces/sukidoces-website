import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';

// Interface usada apenas para o HTML da tela
export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`; 

  // Histórico oficial no padrão Google Gemini
  private history: any[] = []; 

  constructor(private http: HttpClient) {
    // 1. Ao iniciar o serviço, tenta recuperar o histórico do sessionStorage
    const historicoSalvo = sessionStorage.getItem('suki_chat_history');
    if (historicoSalvo) {
      this.history = JSON.parse(historicoSalvo);
    }
  }

  /**
   * 2. Método que o HTML vai chamar para desenhar o chat.
   * Ele pega o histórico do Gemini e traduz para o formato simples do frontend.
   */
  getHistoricoDisplay(): ChatMessage[] {
    return this.history.map(item => ({
      role: item.role === 'model' ? 'bot' : 'user',
      text: item.parts[0].text
    }));
  }

  /**
   * 3. Envia a mensagem para a API e salva o passo do usuário no cache
   */
  enviarMensagem(mensagem: string): Observable<any> {
    const payload = {
      message: mensagem,
      history: this.history // Envia o histórico ANTES de adicionar a mensagem atual (conforme padrão comum do Gemini)
    };

    // Adiciona a fala do usuário e salva a sessão
    this.history.push({ role: 'user', parts: [{ text: mensagem }] });
    this.atualizarSessao();

    return this.http.post<any>(this.apiUrl, payload);
  }

  /**
   * 4. Guarda a resposta do Bot no histórico para a próxima interação e atualiza o cache
   */
  adicionarRespostaBotAoHistorico(resposta: string) {
    this.history.push({ role: 'model', parts: [{ text: resposta }] });
    this.atualizarSessao();
  }

  /**
   * 5. Limpa a conversa
   */
  limparChat() {
    this.history = [];
    sessionStorage.removeItem('suki_chat_history');
  }

  /**
   * Função auxiliar para não repetir código
   */
  private atualizarSessao() {
    sessionStorage.setItem('suki_chat_history', JSON.stringify(this.history));
  }
}