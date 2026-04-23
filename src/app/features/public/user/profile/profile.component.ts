import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService, UserProfile } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading: boolean = true;
  feedbackMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      telefone: ['', [Validators.pattern('^[0-9]{9,11}$')]], // Apenas números, entre 9 e 11 dígitos  
      endereco: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profileForm.patchValue(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do perfil:', err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.userService.updateProfile(this.profileForm.getRawValue()).subscribe({
        next: () => {
          this.feedbackMessage = 'Dados atualizados com sucesso!';
          this.isLoading = false;
        },
        error: (err) => {
          this.feedbackMessage = 'Erro ao atualizar dados. Tente novamente.';
          this.isLoading = false;
        }
      });
    }
  }

  deleteAccount(): void {
    const isConfirmed = confirm('Tem a certeza absoluta que deseja apagar a sua conta? Esta ação é irreversível.');

    if (isConfirmed) {
      console.log('A iniciar processo de eliminação de conta...');
      // A sua lógica para apagar a conta aqui
    }
  }
}