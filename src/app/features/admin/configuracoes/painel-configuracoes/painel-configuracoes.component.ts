import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  
  // URL da foto padrão (pode vir do banco de dados no futuro)
  fotoPerfil: string = 'assets/admin/default-avatar.png'; 

  // Injetando o HttpClient para conectar com o Node.js
  private http = inject(HttpClient);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.configForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senhaAtual: [''],
      novaSenha: [''],
      confirmaSenha: ['']
    }, { validators: this.senhasIguaisValidator });

    this.carregarDadosAdmin();
  }

  carregarDadosAdmin() {
    // CORRIGIDO: Rota exata onde o seu server.js está apontando
    this.http.get<any>(`${environment.apiUrl}/admin/configuracoes`).subscribe({
      next: (adminAtual) => {
        this.configForm.patchValue({
          nome: adminAtual.nome,
          email: adminAtual.email
        });
      },
      error: (err) => {
        console.error('Erro ao carregar dados do admin:', err);
      }
    });
  }

  senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('novaSenha')?.value;
    const confirma = control.get('confirmaSenha')?.value;

    if (senha && confirma && senha !== confirma) {
      control.get('confirmaSenha')?.setErrors({ senhasDiferentes: true });
      return { senhasDiferentes: true };
    }
    return null;
  }

  onFotoSelecionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoPerfil = URL.createObjectURL(file);
    }
  }

  onSubmit() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.configForm.invalid) {
      this.mensagemErro = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    const dadosAtualizados = this.configForm.value;

    // CORRIGIDO: Rota de PUT exata onde o seu server.js está apontando
    this.http.put(`${environment.apiUrl}/admin/configuracoes`, dadosAtualizados).subscribe({
      next: () => {
        this.mensagemSucesso = 'Alterações salvas com sucesso!';
        this.configForm.patchValue({
          senhaAtual: '',
          novaSenha: '',
          confirmaSenha: ''
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
        this.mensagemErro = err.error?.mensagem || 'Erro ao salvar as configurações. Verifique sua senha atual.';
      }
    });
  }
}
