import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

/** Rotas de autenticação: nunca tentam renovar o token (evita loop). */
const AUTH_ROUTES = ['/usuario/login', '/admin/login', '/usuario/registro', '/usuario/refresh'];

const withToken = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Só envia o token para a nossa API (nunca para viacep etc.).
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const isAuthRoute = AUTH_ROUTES.some((route) => req.url.includes(route));
  const token = authService.getAccessToken();
  const authReq =
    token && !isAuthRoute && !req.headers.has('Authorization') ? withToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      // O access token do NestJS dura 15 min: em 401 renovamos uma vez com o refresh token.
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthRoute &&
        authService.hasRefreshToken()
      ) {
        return authService.refreshSession().pipe(
          switchMap((newToken) => next(withToken(req, newToken))),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
