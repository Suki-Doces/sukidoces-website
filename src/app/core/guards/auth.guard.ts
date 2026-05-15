import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function tokenIsValid(token: string | null): boolean {
    if (!token) {
        return false;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) {
            return true;
        }
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('suki_token');

    if (tokenIsValid(token)) {
        return true;
    }

    localStorage.removeItem('suki_token');
    localStorage.removeItem('suki_user');
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
