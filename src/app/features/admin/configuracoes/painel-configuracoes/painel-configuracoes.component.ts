import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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

    // 2. Simula a busca dos dados do Admin atual (que virão do Node.js)
    this.carregarDadosAdmin();
  }

  carregarDadosAdmin() {
    // Aqui você faria um GET para a sua API
    const adminAtual = {
      nome: 'Tiago Oliveira',
      email: 'admin@sukidoces.com'
    };

    // Preenche o formulário automaticamente com os dados do banco
    this.configForm.patchValue({
      nome: adminAtual.nome,
      email: adminAtual.email
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
      // Cria um link temporário para mostrar a imagem na tela antes de salvar
      this.fotoPerfil = URL.createObjectURL(file);
      // Aqui no futuro você adiciona a lógica de enviar esse 'file' (FormData) para o Node.js
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
    console.log('Dados prontos para enviar para o Node.js:', dadosAtualizados);

    // Simulação do sucesso da gravação
    // Aqui entrará o seu this.http.put('...', dadosAtualizados).subscribe(...)
    this.mensagemSucesso = 'Alterações salvas com sucesso!';
    
    // Limpa apenas os campos de senha após salvar
    this.configForm.patchValue({
      senhaAtual: '',
      novaSenha: '',
      confirmaSenha: ''
    });
  }
}
