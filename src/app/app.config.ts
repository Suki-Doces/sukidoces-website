import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
          scrollPositionRestoration: 'enabled',
          anchorScrolling: 'enabled'
        })
    ),
    // Habilita o HTTP já com o seu Interceptor de autenticação tudo junto
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};