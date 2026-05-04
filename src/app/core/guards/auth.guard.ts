import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAdmin()) {
        return true; // É admin, pode passar!
    }

    router.navigate(['/home']);
    return false;
}