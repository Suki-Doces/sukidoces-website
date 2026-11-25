import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Adaptador do contrato da API NestJS.
 *
 * - Identifica o site como canal de venda (`X-Client-Platform: web`), para o painel
 *   saber se o pedido veio do site ou do app mobile.
 * - O NestJS responde a maioria das rotas no envelope `{ success, message, data }`.
 *   Aqui o envelope é removido, então os componentes recebem direto o `data`
 *   (o mesmo formato que o antigo backend Express devolvia).
 * - Erros do NestJS trazem `message` (às vezes uma lista); copiamos para `mensagem`,
 *   campo que vários componentes já leem.
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const request = req.headers.has('X-Client-Platform')
    ? req
    : req.clone({ setHeaders: { 'X-Client-Platform': 'web' } });

  return next(request).pipe(
    map((event: HttpEvent<unknown>) =>
      event instanceof HttpResponse ? event.clone({ body: unwrapEnvelope(event.body) }) : event,
    ),
    catchError((error: unknown) => throwError(() => normalizeError(error))),
  );
};

export function unwrapEnvelope(body: unknown): unknown {
  if (
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    (body as { success?: unknown }).success === true &&
    'data' in body
  ) {
    return (body as { data: unknown }).data;
  }
  return body;
}

function normalizeError(error: unknown): unknown {
  if (!(error instanceof HttpErrorResponse)) return error;

  const body = error.error;
  if (!body || typeof body !== 'object' || 'mensagem' in body) return error;

  const raw = (body as { message?: unknown }).message;
  const message = Array.isArray(raw) ? raw.join(' ') : raw;

  return new HttpErrorResponse({
    error: { ...body, message, mensagem: message },
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined,
  });
}
