import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    // Verifica se o token existe no navegador
    const token = localStorage.getItem('suki_token');

    if (token) {
        return true; // Está logado, pode passar!
    }

    // Não está logado? Redireciona para a página de login
    router.navigate(['/login']);
    return false;
};