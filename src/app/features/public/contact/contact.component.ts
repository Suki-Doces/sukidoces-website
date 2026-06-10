import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgxMaskDirective } from 'ngx-mask';
import { UserService } from 'src/app/core/services/user.service';

interface ContactMessage {
  id_contato: number;
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
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  successMessage = false;
  errorMessage = '';
  messages: ContactMessage[] = [];
  loadingHistory = false;
  historyError = '';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private userService: UserService // 💡 Injetado aqui para buscar dados do perfil
  ) { }

  ngOnInit(): void {
    // Mantém exatamente as validações e campos originais
    this.contactForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      assunto: ['duvida', Validators.required],
      mensagem: ['', [Validators.required, Validators.minLength(10)]]
    });

    // 💡 LÓGICA DE AUTO-PREENCHIMENTO: Busca os dados do usuário conectado
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        const userData = res.user || res;
        if (userData) {
          this.contactForm.patchValue({
            nome: userData.nome || '',
            email: userData.email || '',
            telefone: userData.telefone || '' // Se houver telefone no perfil, já preenche também
          });
        }
      },
      error: (err) => {
        // Ignora silenciosamente para visitantes que não estão logados
        console.log('Visitante não autenticado. O formulário de contato permanecerá em branco.');
      }
    });

    // Mantém a inicialização do seu histórico original
    this.carregarHistorico();
  }

  get f() { return this.contactForm.controls; }

  private carregarHistorico(): void {
    if (!localStorage.getItem('suki_token')) {
      return;
    }

    this.loadingHistory = true;
    this.historyError = '';

    this.http.get<{ messages: ContactMessage[] }>(`${environment.apiUrl}/contatos/me`).subscribe({
      next: (res) => {
        this.messages = res.messages;
        this.loadingHistory = false;
      },
      error: (err) => {
        this.historyError = err.error?.message || 'Não foi possível carregar o histórico de mensagens.';
        this.loadingHistory = false;
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.http.post<{ message: string }>(`${environment.apiUrl}/contatos`, this.contactForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = true;
        this.contactForm.reset({ assunto: 'duvida' });
        this.carregarHistorico();
        setTimeout(() => this.successMessage = false, 5000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Erro ao enviar a mensagem. Tente novamente.';
      }
    });
  }
}