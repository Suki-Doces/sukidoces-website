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
  ) { }

  ngOnInit(): void {
    // Inicialização do Formulário com os novos campos (cpf e data_nascimento)
    this.profileForm = this.fb.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]], // Email costuma ser desabilitado
      telefone: [''],
      cpf: [''],
      data_nascimento: [''],
      cep: [''],
      rua: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      estado: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });

    this.loadDataUser();
  }

  // ==========================================
  // CARREGAR DADOS DO UTILIZADOR
  // ==========================================
  private loadDataUser(): void {
    this.isLoading = true;

    this.userService.getProfile().subscribe({
      next: (res: any) => {
        // Se o backend não enviar dentro de "user", pega a resposta direta
        const databd = res.user || res;

        if (databd) {
          this.user = databd;
          this.loadOrders();

          let cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = '';

          // 1. Fallback para formato antigo (caso ainda exista na base de dados)
          if (databd.enderecos && databd.enderecos.length > 0) {
            const addr = databd.enderecos[0];
            this.user.id_endereco_atual = addr.id_endereco; // Armazene o ID do endereço
            cep = addr.cep || '';
            rua = addr.logradouro || addr.rua || '';
            numero = addr.numero || '';
            complemento = addr.complemento || '';
            bairro = addr.bairro || '';
            cidade = addr.cidade || '';
            estado = addr.estado || '';
          }

          // 3. Formatar Data de Nascimento para o input type="date" (YYYY-MM-DD)
          let dataNascimentoFormatada = '';
          if (databd.data_nascimento) {
            dataNascimentoFormatada = databd.data_nascimento.split('T')[0];
          }

          // Preenche o formulário visual com os dados encontrados
          this.profileForm.patchValue({
            nome: databd.nome || '',
            email: databd.email || '',
            telefone: databd.telefone || '',
            cpf: databd.cpf || '',
            data_nascimento: dataNascimentoFormatada,
            cep: cep,
            rua: rua,
            numero: numero,
            complemento: complemento,
            bairro: bairro,
            cidade: cidade,
            estado: estado
          });

          // Atualiza o nome de exibição
          if (databd.nome) {
            const parts = databd.nome.trim().split(' ');
            this.displayName = parts.length > 1
              ? `${parts[0]} ${parts[parts.length - 1]}`
              : parts[0];
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar perfil completo:', err);
        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // ATUALIZAR PERFIL
  // ==========================================
  updateProfile(): void {
    if (this.profileForm.invalid || this.isLoading) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.message = null;

    const formValue = this.profileForm.getRawValue();

    // 1. Tratamento seguro da Data de Nascimento (ISO 8601 para o Prisma)
    let dataNascimentoPrisma = null;
    if (formValue.data_nascimento && formValue.data_nascimento.trim() !== '') {
      // Converte 'YYYY-MM-DD' para o formato Date que o Prisma aceita nativamente
      dataNascimentoPrisma = new Date(formValue.data_nascimento).toISOString();
    }

    // Empacota o endereço num Array, EXATAMENTE como o Checkout espera
    const cidadeEstadoFormatado = formValue.cidade && formValue.estado
      ? `${formValue.cidade} - ${formValue.estado}`
      : '';

    const enderecoFormatado = [
      formValue.cep,
      formValue.rua,
      formValue.numero,
      formValue.complemento,
      formValue.bairro,
      cidadeEstadoFormatado
    ];

    // Monta o objeto padronizado do Utilizador
    const dadosParaAtualizar = {
      id_usuario: this.user.id_usuario || this.user.id,
      nome: formValue.nome,
      telefone: formValue.telefone,
      cpf: formValue.cpf,
      data_nascimento: dataNascimentoPrisma,
      enderecos: {
        update: {
          where: {
            // O Prisma agora saberá qual registro específico atualizar
            id_endereco: this.user.id_endereco_atual
          },
          data: {
            cep: formValue.cep,
            logradouro: formValue.rua,
            numero: formValue.numero,
            complemento: formValue.complemento,
            bairro: formValue.bairro,
            cidade: formValue.cidade, // Ajuste para bater com o seu schema
            estado: formValue.estado
          }
        }
      }
    };

    this.userService.updateProfile(dadosParaAtualizar as any)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: any) => {
          this.message = { type: 'success', text: 'Dados e endereço guardados com sucesso!' };

          // Atualiza o localStorage para o Checkout ler perfeitamente
          this.authService.updateUserInStorage({
            ...this.user,
            ...dadosParaAtualizar,
          });

          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err: any) => {
          console.error('Erro ao atualizar:', err);
          this.message = {
            type: 'error',
            text: err.error?.message || 'Ocorreu um erro ao atualizar os dados no servidor.'
          };
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  // ==========================================
  // FUNÇÕES DE INTERAÇÃO COM O HTML
  // ==========================================

  // 1. Busca o CEP automaticamente usando a API ViaCEP
  buscarCep(): void {
    let cep = this.profileForm.get('cep')?.value;

    if (cep) {
      cep = cep.replace(/\D/g, ''); // Remove os traços da máscara

      if (cep.length === 8) {
        this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
          next: (data: any) => {
            if (!data.erro) {
              // Preenche os campos do formulário automaticamente
              this.profileForm.patchValue({
                rua: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf
              });
            }
          },
          error: (err) => console.error('Erro ao buscar o CEP:', err)
        });
      }
    }
  }

  // 2. Abre os detalhes de um pedido específico
  viewOrderDetails(pedido: any): void {
    this.selectedOrder = pedido;
    this.activeTab = 'detalhes-pedido';
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a página suavemente
  }

  // 3. Função para excluir conta (deve ser ligada à sua API)
  deleteAccount(): void {
    if (confirm('Tem a certeza absoluta de que deseja excluir a sua conta permanentemente? Esta ação é irreversível.')) {

      /* QUANDO A ROTA DE EXCLUSÃO ESTIVER PRONTA NO NODE.JS, USE ISTO:
      this.isLoading = true;
      this.userService.deleteProfile().subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Erro ao excluir conta:', err);
          this.isLoading = false;
        }
      });
      */

      alert('Funcionalidade de exclusão em desenvolvimento.');
    }
  }

  // ==========================================
  // MÉTODOS DE APOIO E OUTRAS FUNÇÕES
  // ==========================================
  switchTab(tab: string): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
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
          this.message = { type: 'error', text: err.error?.message || 'Erro ao alterar a senha.' };
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}