import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface ContactMessage {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
  respondido: boolean;
  resposta: string | null;
  data_criacao: string;
  data_resposta: string | null;
}

@Component({
  selector: 'app-lista-contatos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-contatos.component.html',
  styleUrls: ['./lista-contatos.component.css']
})
export class ListaContatosComponent implements OnInit {
  private http = inject(HttpClient);

  mensagens: ContactMessage[] = [];
  respostaPorMensagem: Record<number, string> = {};
  carregando = false;
  erro = '';
  sucesso = '';

  private apiUrl = `${environment.apiUrl}/admin/contatos`;

  ngOnInit() {
    this.carregarMensagens();
  }

  carregarMensagens() {
    this.carregando = true;
    this.http.get<{ messages: ContactMessage[] }>(this.apiUrl).subscribe({
      next: (dados) => {
        this.mensagens = dados.messages;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar mensagens de contato', err);
        this.erro = 'Não foi possível carregar as mensagens. Tente novamente.';
        this.carregando = false;
      }
    });
  }

  enviarResposta(id: number) {
    const resposta = (this.respostaPorMensagem[id] || '').trim();
    if (!resposta) {
      this.erro = 'Preencha a resposta antes de enviar.';
      return;
    }

    this.http.put<{ message: string; contato: ContactMessage }>(`${this.apiUrl}/${id}/respond`, { resposta }).subscribe({
      next: (respostaApi) => {
        this.sucesso = respostaApi.message;
        this.erro = '';
        const index = this.mensagens.findIndex(msg => msg.id === id);
        if (index !== -1) {
          this.mensagens[index] = respostaApi.contato;
        }
      },
      error: (err) => {
        console.error('Erro ao enviar resposta', err);
        this.erro = err.error?.message || 'Falha ao registrar a resposta.';
      }
    });
  }
}
