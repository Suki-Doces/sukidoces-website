import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Registra o locale pt-BR
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      }),
    ),

    provideAnimationsAsync(),
    // Habilita o HTTP já com o seu Interceptor de autenticação tudo junto
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};