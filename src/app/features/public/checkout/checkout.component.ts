import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { CheckoutService, UsuarioCheckout } from 'src/app/core/services/checkout.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  salvandoDados = false;

  constructor(
    private fb: FormBuilder, 
    private checkoutService: CheckoutService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Mapeando exatamente os campos da imagem
    this.checkoutForm = this.fb.group({
      nome: [{value: '', disabled: true}, Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      telefone: ['', Validators.required],
      
      // Endereço de Entrega
      cep: ['', Validators.required],
      ruaAvenida: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidadeEstado: ['', Validators.required]
    });

    // 2. Preenchendo os dados do usuário
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const userData: any = user; 

        let enderecoArray: string[] = [];
        if (userData.endereco) {
          try {
            enderecoArray = typeof userData.endereco === 'string' ? JSON.parse(userData.endereco) : userData.endereco;
          } catch (e) {
            console.error('Erro ao ler array de endereço', e);
          }
        }

        this.checkoutForm.patchValue({
          nome: userData.nome || '',
          email: userData.email || '',
          cpf: userData.cpf || '',
          telefone: userData.telefone || '',
          cep: enderecoArray[0] || '',
          ruaAvenida: enderecoArray[1] || '',
          numero: enderecoArray[2] || '',
          complemento: enderecoArray[3] || '',
          bairro: enderecoArray[4] || '',
          cidadeEstado: enderecoArray[5] || ''
        });
      }
    });
  }

  onAutoSaveBlur(): void {
    if (this.checkoutForm.get('cpf')?.valid) {
      this.salvarUsuarioNoBanco();
    }
  }

  private salvarUsuarioNoBanco(): void {
    this.salvandoDados = true;
    const formValue = this.checkoutForm.getRawValue();

    // 3. Monta o Array com 6 posições baseado na imagem
    const enderecoFormatado = [
      formValue.cep,
      formValue.ruaAvenida,
      formValue.numero,
      formValue.complemento,
      formValue.bairro,
      formValue.cidadeEstado
    ];

    const payload: UsuarioCheckout = {
      nome: formValue.nome,
      email: formValue.email,
      cpf: formValue.cpf,
      telefone: formValue.telefone,
      endereco: JSON.stringify(enderecoFormatado) 
    };

    this.checkoutService.autoSalvarUsuario(payload).subscribe({
      next: () => {
        this.salvandoDados = false;
      },
      error: (err) => {
        console.error('Erro ao auto-salvar:', err);
        this.salvandoDados = false;
      }
    });
  }

  finalizarCompra(): void {
    if (this.checkoutForm.valid) {
      console.log('Indo para o pagamento com:', this.checkoutForm.getRawValue());
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }
}