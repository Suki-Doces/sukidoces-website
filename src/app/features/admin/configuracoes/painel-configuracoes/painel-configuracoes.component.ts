import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-painel-configuracoes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './painel-configuracoes.component.html',
  styleUrl: './painel-configuracoes.component.css'
})
export class PainelConfiguracoesComponent implements OnInit {
  configForm!: FormGroup;

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  // Foto padrão
  fotoPerfil: string = 'assets/admin/default-avatar.png';

  // Arquivo real selecionado
  fotoArquivo: File | null = null;

  private http = inject(HttpClient);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.configForm = this.fb.group(
      {
        nome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        senhaAtual: [''],
        novaSenha: [''],
        confirmaSenha: ['']
      },
      {
        validators: this.senhasIguaisValidator
      }
    );

    this.carregarDadosAdmin();
  }

  carregarDadosAdmin(): void {
    this.http
      .get<any>(`${environment.apiUrl}/admin/configuracoes`)
      .subscribe({
        next: (adminAtual) => {
          this.configForm.patchValue({
            nome: adminAtual.nome,
            email: adminAtual.email
          });

          // Carrega a foto salva no banco
          if (adminAtual.foto_perfil) {
            this.fotoPerfil = adminAtual.foto_perfil;
          }
        },
        error: (err) => {
          console.error('Erro ao carregar dados do admin:', err);
        }
      });
  }

  senhasIguaisValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const senha = control.get('novaSenha')?.value;
    const confirma = control.get('confirmaSenha')?.value;

    if (senha && confirma && senha !== confirma) {
      control
        .get('confirmaSenha')
        ?.setErrors({ senhasDiferentes: true });

      return { senhasDiferentes: true };
    }

    return null;
  }

  onFotoSelecionada(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // Guarda o arquivo para envio
      this.fotoArquivo = file;

      // Preview local
      this.fotoPerfil = URL.createObjectURL(file);
    }
  }

  onSubmit(): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.configForm.invalid) {
      this.mensagemErro =
        'Por favor, preencha todos os campos corretamente.';
      return;
    }

    const formData = new FormData();

    formData.append(
      'nome',
      this.configForm.get('nome')?.value || ''
    );

    formData.append(
      'email',
      this.configForm.get('email')?.value || ''
    );

    formData.append(
      'senhaAtual',
      this.configForm.get('senhaAtual')?.value || ''
    );

    formData.append(
      'novaSenha',
      this.configForm.get('novaSenha')?.value || ''
    );

    // Anexa a foto se existir
    if (this.fotoArquivo) {
      formData.append(
        'foto_perfil',
        this.fotoArquivo,
        this.fotoArquivo.name
      );
    }

    this.http
      .put(
        `${environment.apiUrl}/admin/configuracoes`,
        formData
      )
      .subscribe({
        next: () => {
          this.mensagemSucesso =
            'Alterações salvas com sucesso!';

          // Limpa o arquivo após salvar
          this.fotoArquivo = null;

          this.configForm.patchValue({
            senhaAtual: '',
            novaSenha: '',
            confirmaSenha: ''
          });
        },
        error: (err) => {
          console.error('Erro ao atualizar perfil:', err);

          this.mensagemErro =
            err.error?.mensagem ||
            'Erro ao salvar as configurações. Verifique sua senha atual.';
        }
      });
  }
}