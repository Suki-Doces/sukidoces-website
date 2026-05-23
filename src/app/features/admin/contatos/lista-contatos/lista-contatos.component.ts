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

  // NOVA FUNÇÃO ATUALIZADA COM O SEU FALLBACK
  carregarContatos() {
    this.carregando = true;

    // Alterado de <any[]> para <any> pois a API envia um objeto JSON
    this.http.get<any>(`${environment.apiUrl}/admin/contatos`).subscribe({
      next: (resposta) => {
        // Extraindo o array que veio dentro da propriedade 'messages'
        const dados = resposta.messages;

        // Se tiver dados reais, exibe. Se vier vazio, pode colocar [] ao invés dos mocks se quiser que fique limpo.
        this.contatos = dados && dados.length > 0 ? dados : this.getMockContatos();
        this.carregando = false;
      },
      error: () => {
        // Sem conexão ou erro na API? Usa os dados de exemplo mesmo
        this.contatos = this.getMockContatos();
        this.carregando = false;
      }
    });
  }

  // ATENÇÃO!!! Criar rotas no back para funções de 'Marcar como lida' e 'Excluir'

  // OS SEUS DADOS DE EXEMPLO (MOCK)
  private getMockContatos(): any[] {
    return [
      {
        id_contato: 1,
        nome: 'Ana Paula Lima',
        email: 'ana.lima@gmail.com',
        assunto: 'Dúvida',
        mensagem: 'Olá! Gostaria de saber se os doces podem ser feitos sem açúcar, pois tenho restrições alimentares. Também queria saber o prazo mínimo para encomendar.',
        data_criacao: new Date('2025-05-17T14:32:00'),
        respondido: false,
        resposta: null,
        data_resposta: null
      },
      {
        id_contato: 2,
        nome: 'Carlos Mendes',
        email: 'carlos.m@outlook.com',
        assunto: 'Reclamação',
        mensagem: 'Recebi meu pedido hoje e alguns brigadeiros estavam amassados na embalagem. Fiquei desapontado porque era um presente de aniversário. Espero que possam resolver isso.',
        data_criacao: new Date('2025-05-16T09:10:00'),
        respondido: false,
        resposta: null,
        data_resposta: null
      },
      {
        id_contato: 3,
        nome: 'Fernanda Costa',
        email: 'fecosta@gmail.com',
        assunto: 'Sugestão',
        mensagem: 'Amo os produtos de vocês! Seria incrível se tivessem uma opção de caixa mista para presente com sabores variados. Tenho certeza que venderia muito!',
        data_criacao: new Date('2025-05-15T16:55:00'),
        respondido: true,
        resposta: 'Oi Fernanda! Que ótima ideia, já está nos nossos planos para o próximo mês. Obrigada pelo carinho!',
        data_resposta: new Date('2025-05-15T18:00:00')
      },
      {
        id_contato: 4,
        nome: 'Roberto Alves',
        email: 'roberto@empresa.com.br',
        assunto: 'Parcerias',
        mensagem: 'Tenho uma empresa de eventos corporativos e gostaria de conversar sobre fornecimento de doces para nossos eventos mensais. Temos demanda de aproximadamente 300 unidades por mês.',
        data_criacao: new Date('2025-05-14T11:20:00'),
        respondido: false,
        resposta: null,
        data_resposta: null
      },
      {
        id_contato: 5,
        nome: 'Juliana Ferreira',
        email: 'ju.ferreira@hotmail.com',
        assunto: 'Dúvida',
        mensagem: 'Vocês entregam para o interior de SP? Moro em Campinas e adoraria pedir, mas não encontrei informação sobre a área de entrega no site.',
        data_criacao: new Date('2025-05-13T20:05:00'),
        respondido: true,
        resposta: 'Oi Juliana! Por enquanto entregamos apenas na Grande São Paulo, mas estamos expandindo em breve. Te avisamos assim que Campinas estiver disponível!',
        data_resposta: new Date('2025-05-14T09:30:00')
      },
      {
        id_contato: 6,
        nome: 'Marcos Souza',
        email: 'marcos.souza@gmail.com',
        assunto: 'Sugestão',
        mensagem: 'Seria legal ter um programa de fidelidade! Já comprei várias vezes e adoraria acumular pontos para ganhar descontos. Tenho amigos que também comprariam mais com essa motivação.',
        data_criacao: new Date('2025-05-12T08:44:00'),
        respondido: false,
        resposta: null,
        data_resposta: null
      }
    ];
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
    if (!assunto) return 'subj-duvida';

    const textoNormalizado = assunto.toLowerCase();

    if (textoNormalizado.includes('Reclamação') || textoNormalizado.includes('Reclamacao') || textoNormalizado.includes('Problema')) {
      return 'subj-Reclamacao';
    }

    if (textoNormalizado.includes('sugestão') || textoNormalizado.includes('Sugestao') || textoNormalizado.includes('Elogio')) {
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
      error: () => {
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
        // Mesmo com erro, remove localmente para testar a interface caso não haja API
        this.contatos = this.contatos.filter(c => c.id_contato !== contato.id_contato);
        if (this.contatoSelecionado && this.contatoSelecionado.id_contato === contato.id_contato) this.fecharModal();
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
        // Fallback: Atualiza a interface mesmo sem a API estar rodando perfeitamente
        this.atualizarContatoLocal();
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