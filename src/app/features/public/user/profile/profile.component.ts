import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { OrderService } from 'src/app/core/services/order.service';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgxMaskDirective } from 'ngx-mask';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'dados';
  displayName: string = '';
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  user: any;
  pedidos: any[] = [];

  // Estados de UI
  isLoading: boolean = false;
  message: { type: 'success' | 'error', text: string } | null = null;
  selectedOrder: any = null;

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.initForms();
  }

  // Método para visualizar detalhes
  viewOrderDetails(pedido: any): void {
    this.selectedOrder = pedido;
    this.activeTab = 'detalhes-pedido';

    this.router.navigate([], {
      queryParams: { tab: 'detalhes-pedido' },
      queryParamsHandling: 'merge'
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
        if (this.activeTab !== 'detalhes-pedido') {
          this.selectedOrder = null;
        }
      }
    });

    this.loadDataUser();
  }

  private loadDataUser(): void {
    this.isLoading = true;

    // Chamamos o serviço que vai à rota GET /perfil que configurámos no backend
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        // O seu backend retorna { user: { ... } }
        const databd = res.user;

        if (databd) {
          this.user = databd;
          this.loadOrders();

          const addr: any = (databd.enderecos && databd.enderecos.length > 0)
            ? databd.enderecos[0]
            : {};

          this.profileForm.patchValue({
            nome: databd.nome,
            email: databd.email,
            telefone: databd.telefone || '',
            cpf: databd.cpf || '',
            cep: addr.cep || '',
            rua: addr.logradouro || '',
            numero: addr.numero || '',
            complemento: addr.complemento || '',
            bairro: addr.bairro || '',
            cidade: addr.cidade || '',
            estado: addr.estado || ''
          });

          const parts = databd.nome.trim().split(' ');
          this.displayName = parts.length > 1
            ? `${parts[0]} ${parts[parts.length - 1]}`
            : parts[0];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar perfil completo:', err);
        this.isLoading = false;
      }
    });
  }

  private initForms(): void {
    // Formulário de Perfil
    this.profileForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      telefone: ['', [Validators.required]],
      cpf: [''],
      cep: ['', [Validators.required]],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required] // <-- Adicionado para o banco
    });

    // Formulário de Senha
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.mustMatch('newPassword', 'confirmPassword') });
  }

  private mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) return;
      matchingControl.setErrors(control.value !== matchingControl.value ? { mustMatch: true } : null);
    };
  }

  buscarCep(): void {
    let cep = this.profileForm.get('cep')?.value;

    if (!cep) return;

    cep = cep.replace(/\D/g, '');

    if (cep.length === 8) {
      this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
        next: (data: any) => {
          if (data.erro) {
            alert('CEP não encontrado!');
            return;
          }

          this.profileForm.patchValue({
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf // Adicionado para preencher o estado
          });
        },
        error: (err) => {
          console.error('Erro ao buscar o CEP:', err);
        }
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid || this.isLoading) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.message = null;

    // Pegamos todos os valores do formulário (incluindo o email desativado)
    const dadosParaAtualizar = this.profileForm.getRawValue();

    this.userService.updateProfile(dadosParaAtualizar)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: any) => {
          this.message = { type: 'success', text: 'Dados e endereço guardados com sucesso!' };

          // MUITO IMPORTANTE: Atualiza o utilizador no AuthService 
          // para que o nome mude no Header e noutras partes do site imediatamente
          this.authService.updateUserInStorage(dadosParaAtualizar);

          // Opcional: faz scroll para o topo para ver a mensagem de sucesso
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err: any) => {
          console.error('Erro ao atualizar:', err);
          this.message = {
            type: 'error',
            text: err.error?.message || 'Ocorreu um erro ao atualizar os dados no servidor.'
          };
        }
      });
  }

  loadOrders(): void {
    if (!this.user) return;
    this.orderService.getUserOrders().subscribe({
      next: (data: any) => {
        this.pedidos = Array.isArray(data) ? data : (data.pedidos || []);
      },
      error: (err) => console.error('Erro ao carregar pedidos', err)
    });
  }

  getProductImage(imageURL: string | null): string {
    if (!imageURL) return this.defaultImage;
    if (imageURL.startsWith('http')) return imageURL;
    return `${environment.productImgUrl}${imageURL}`;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

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

  deleteAccount(): void {
    if (confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      console.log('Excluir conta solicitada');
    }
  }
}
