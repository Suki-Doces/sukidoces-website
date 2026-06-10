import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // 1. Inicialização do formulário reativo com suas respectivas validações
    this.contactForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: [''],
      assunto: ['', Validators.required],
      mensagem: ['', Validators.required]
    });

    // 2. Busca automática dos dados de perfil do usuário logado para auto-preenchimento
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        const userData = res.user || res;
        if (userData) {
          this.contactForm.patchValue({
            nome: userData.nome || '',
            email: userData.email || '',
            cpf: userData.cpf || ''
          });
        }
      },
      error: (err) => {
        // Logado silenciosamente para permitir que usuários anônimos preencham o formulário manualmente
        console.log('Visitante não autenticado ou erro ao recuperar perfil.');
      }
    });
  }

  enviarMensagem(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Lógica de envio do formulário para o backend de contatos
    this.http.post('/api/contato', this.contactForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.';
        // Reseta o formulário mantendo as informações de quem está logado
        const rawValues = this.contactForm.getRawValue();
        this.contactForm.reset({
          nome: rawValues.nome,
          email: rawValues.email,
          cpf: rawValues.cpf,
          assunto: '',
          mensagem: ''
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.mensagem || 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.';
      }
    });
  }
}
