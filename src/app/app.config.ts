import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// Registra o locale pt-BR
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
          scrollPositionRestoration: 'enabled',
          anchorScrolling: 'enabled'
        }),
    ),
    // Habilita o HTTP já com o seu Interceptor de autenticação tudo junto
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};