import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-lista-contatos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-contatos.component.html',
  styleUrls: ['./lista-contatos.component.css']
})
export class ListaContatosComponent implements OnInit {
  contatos: any[] = [];
  carregando: boolean = true;
  erro: string = '';

  contatoSelecionado: any = null;
  respostaTexto: string = '';
  activeTab: 'inbox' | 'awaiting' | 'answered' = 'inbox';

  private http = inject(HttpClient);

  ngOnInit() {
    this.carregarContatos();
  }

  carregarContatos() {
    this.carregando = true;
    this.http.get<any[]>(`${environment.apiUrl}/admin/contatos`).subscribe({
      next: (dados) => {
        this.contatos = dados;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar contatos:', err);
        this.erro = 'Erro ao carregar mensagens. Tente novamente mais tarde.';
        this.carregando = false;
      }
    });
  }

  get inboxCount(): number {
    return this.contatos.length;
  }

  get awaitingCount(): number {
    return this.contatos.filter(c => !c.respondido).length;
  }

  get answeredCount(): number {
    return this.contatos.filter(c => c.respondido).length;
  }

  get filteredContatos(): any[] {
    if (this.activeTab === 'inbox') return this.contatos;
    if (this.activeTab === 'awaiting') return this.contatos.filter(c => !c.respondido);
    return this.contatos.filter(c => c.respondido);
  }

  abrirModal(contato: any) {
    this.contatoSelecionado = contato;
    this.respostaTexto = '';
  }

  markAsRead(contato: any) {
    if (contato.respondido) return;

    // Tentativa de notificar backend — se não existir, atualizamos localmente
    this.http.put(`${environment.apiUrl}/admin/contatos/${contato.id_contato}/mark-read`, {}).subscribe({
      next: () => {
        contato.respondido = true;
      },
      error: () => {
        // Sem endpoint, apenas atualiza localmente para feedback imediato
        contato.respondido = true;
      }
    });
  }

  deletarContato(contato: any) {
    if (!confirm('Deseja realmente excluir essa mensagem?')) return;

    this.http.delete(`${environment.apiUrl}/admin/contatos/${contato.id_contato}`).subscribe({
      next: () => {
        this.contatos = this.contatos.filter(c => c.id_contato !== contato.id_contato);
        if (this.contatoSelecionado && this.contatoSelecionado.id_contato === contato.id_contato) this.fecharModal();
      },
      error: (err) => {
        console.error('Erro ao deletar contato:', err);
        alert('Não foi possível excluir a mensagem.');
      }
    });
  }

  fecharModal() {
    this.contatoSelecionado = null;
    this.respostaTexto = '';
  }

  enviarResposta() {
    if (!this.respostaTexto.trim()) return;

    const id = this.contatoSelecionado.id_contato;

    this.http.put(`${environment.apiUrl}/admin/contatos/${id}/respond`, {
      resposta: this.respostaTexto
    }).subscribe({
      next: () => {
        // Atualiza o contato na tela em tempo real sem precisar recarregar a página!
        this.contatoSelecionado.respondido = true;
        this.contatoSelecionado.resposta = this.respostaTexto;
        this.contatoSelecionado.data_resposta = new Date();
        this.fecharModal();
      },
      error: (err) => {
        console.error('Erro ao enviar resposta:', err);
        alert('Erro ao enviar resposta. Verifique a conexão com o servidor.');
      }
    });
  }
}