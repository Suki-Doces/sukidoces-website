import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { OrderService } from 'src/app/core/services/order.service';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'dados';
  displayName: string = '';
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  user: any;
  pedidos: any[] = []; // Inicializado vazio para receber dados da API

  // Estados de UI
  isLoading: boolean = false;
  message: { type: 'success' | 'error', text: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue(user);
        this.loadOrders(); // Carrega os pedidos reais assim que o utilizador é identificado
        
        // Lógica para extrair Nome e Sobrenome
        const parts = user.nome.trim().split(' ');
        this.displayName = parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1]}`
          : parts[0];
      }
    });
  }

  private initForms(): void {
    // Formulário de Perfil
    this.profileForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }], // O e-mail normalmente não se altera por segurança
      telefone: ['', [Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
      cpf: ['', [Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]]
    });

    // Formulário de Senha
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.mustMatch('newPassword', 'confirmPassword') });
  }

  // Validador auxiliar para confirmar se as senhas coincidem
  private mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) return;
      matchingControl.setErrors(control.value !== matchingControl.value ? { mustMatch: true } : null);
    };
  }


  // Chamada à API para atualizar dados
  updateProfile(): void {
    if (this.profileForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.message = null;

    // Usando updateProfile que já existe no seu UserService (não precisa passar o ID)
    this.userService.updateProfile(this.profileForm.getRawValue())
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: any) => {
          this.message = { type: 'success', text: 'Dados atualizados com sucesso!' };
          // Atualiza o utilizador no estado global para refletir as mudanças no header
          this.authService.updateUserInStorage(this.profileForm.getRawValue());
        },
        error: (err: any) => this.message = { type: 'error', text: 'Ocorreu um erro ao atualizar os dados.' }
      });
  }

  // Chamada à API para carregar pedidos reais
  loadOrders(): void {
    if (!this.user?.id) return;

    this.orderService.getUserOrders(this.user.id).subscribe({
      next: (data: any) => this.pedidos = data,
      error: (err: any) => console.error('Erro ao carregar pedidos', err)
    });
  }
  // Chamada à API para mudar senha
  changePassword(): void {
    if (this.passwordForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.message = null;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword(this.user.id, currentPassword, newPassword)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: any) => {
          this.message = { type: 'success', text: 'Senha alterada com sucesso!' };
          this.passwordForm.reset();
        },
        error: (err: any) => {
          this.message = { type: 'error', text: err.error?.message || 'Erro ao alterar senha.' };
        }
      });
  }
}