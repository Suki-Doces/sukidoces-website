import { Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

/** Destino do link de confirmação enviado pela API (FRONTEND_URL/verificar-email?token=...). */
@Component({
    selector: 'app-verify-email',
    imports: [RouterModule],
    template: `
    <section class="verify-email">
      @switch (estado) {
        @case ('carregando') {
          <p>Confirmando seu e-mail...</p>
        }
        @case ('ok') {
          <h1>E-mail confirmado!</h1>
          <p>Sua conta está ativa no site e no aplicativo Suki Doces.</p>
          <a routerLink="/login" class="btn btn-glass btn-primary">Fazer login</a>
        }
        @default {
          <h1>Não foi possível confirmar</h1>
          <p>{{ erro }}</p>
          <a routerLink="/login" class="btn btn-glass btn-primary">Voltar ao login</a>
        }
      }
    </section>
    `,
    styles: [
        `
      .verify-email {
        max-width: 480px;
        margin: 160px auto 80px;
        padding: 32px 24px;
        text-align: center;
        border-radius: 20px;
        background: #fff;
        border: 1px solid #f7b5cc;
      }
      .verify-email h1 {
        font-size: 1.5rem;
        margin-bottom: 12px;
      }
      .verify-email p {
        margin-bottom: 20px;
      }
    `,
    ]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  estado: 'carregando' | 'ok' | 'erro' = 'carregando';
  erro = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.estado = 'erro';
      this.erro = 'Link de confirmação incompleto.';
      return;
    }

    this.authService.verificarEmail(token).subscribe({
      next: () => (this.estado = 'ok'),
      error: () => {
        this.estado = 'erro';
        this.erro = 'O link é inválido ou expirou. Faça um novo cadastro ou fale conosco.';
      },
    });
  }
}
