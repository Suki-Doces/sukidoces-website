import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-lista-contatos',
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

  // NOVA FUNÇÃO ATUALIZADA COM O SEU FALLBACK
  carregarContatos() {
    this.carregando = true;

    // Alterado de <any[]> para <any> pois a API envia um objeto JSON
    this.http.get<any>(`${environment.apiUrl}/admin/contatos`).subscribe({
      next: (resposta) => {
        // Extraindo o array que veio dentro da propriedade 'messages'
        const dados = resposta.messages;

        // Dados reais da API (inclui mensagens enviadas pelo app mobile).
        this.contatos = dados ?? [];
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar contatos:', err);
        this.contatos = [];
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

  getSubjectClass(assunto: string): string {
    if (!assunto) return 'subj-Duvida';

    const textoNormalizado = assunto.toLowerCase();

    if (textoNormalizado.includes('Reclamação') || textoNormalizado.includes('Reclamacao') || textoNormalizado.includes('Problema')) {
      return 'subj-Reclamacao';
    }

    if (textoNormalizado.includes('Sugestão') || textoNormalizado.includes('Sugestao') || textoNormalizado.includes('Elogio')) {
      return 'subj-Sugestao';
    }

    if (textoNormalizado.includes('Parceria') || textoNormalizado.includes('Fornecedor')) {
      return 'subj-Parcerias';
    }

    return 'subj-Duvida';
  }

  abrirModal(contato: any) {
    this.contatoSelecionado = contato;
    this.respostaTexto = '';
  }

  markAsRead(contato: any) {
    if (contato.respondido) return;

    this.http.put(`${environment.apiUrl}/admin/contatos/${contato.id_contato}/mark-read`, {}).subscribe({
      next: () => {
        contato.respondido = true;
      },
      error: (err) => {
        console.error('Erro ao marcar contato:', err);
        alert('Não foi possível marcar a mensagem como resolvida.');
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
        this.atualizarContatoLocal();
      },
      error: (err) => {
        console.error('Erro ao enviar resposta:', err);
        alert(err.error?.mensagem || 'Não foi possível enviar a resposta.');
      }
    });
  }

  // Função auxiliar para evitar repetição de código no sucesso ou erro (fallback) da resposta
  private atualizarContatoLocal() {
    this.contatoSelecionado.respondido = true;
    this.contatoSelecionado.resposta = this.respostaTexto;
    this.contatoSelecionado.data_resposta = new Date();
    this.fecharModal();
  }
}