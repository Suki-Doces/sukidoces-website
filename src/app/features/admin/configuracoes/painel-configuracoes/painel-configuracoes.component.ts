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
    // 1. Inicializa o formulário com as validações
    this.configForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senhaAtual: [''],
      novaSenha: [''],
      confirmaSenha: ['']
    }, { validators: this.senhasIguaisValidator });

    // 2. Busca os dados reais do Admin
    this.carregarDadosAdmin();
  }

  carregarDadosAdmin() {
    this.http.get<any>(`${environment.apiUrl}/admin/perfil`).subscribe({
      next: (adminAtual) => {
        // Preenche o formulário com os dados vindos do banco
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

  // Validador customizado: garante que a nova senha e a confirmação são iguais
  senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('novaSenha')?.value;
    const confirma = control.get('confirmaSenha')?.value;

    if (senha && confirma && senha !== confirma) {
      control.get('confirmaSenha')?.setErrors({ senhasDiferentes: true });
      return { senhasDiferentes: true };
    }
    return null;
  }

  // Lógica para quando o utilizador escolhe uma foto do PC
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

    // Conexão real com a rota PUT de configuração
    this.http.put(`${environment.apiUrl}/admin/perfil`, dadosAtualizados).subscribe({
      next: () => {
        this.mensagemSucesso = 'Alterações salvas com sucesso!';
        
        // Limpa apenas os campos de senha após salvar
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
