import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environments';

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

  abrirModal(contato: any) {
    this.contatoSelecionado = contato;
    this.respostaTexto = '';
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