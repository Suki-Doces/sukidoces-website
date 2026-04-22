import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // I - Busca o token do localStorage
    const token = localStorage.getItem('suki_token');

    // II - Se o token existir, clona a requisição e injeta ao header
    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        // III - Envia a req modificada
        return next(authReq);
    }

    // IV - Se não houver token, envia a req original
    return next(req);
}