import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, pipe, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environments.development';

interface User {
  id: number;
  nome: string;
  email: string;
  nivel: 'admin' | 'cliente';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '${environment.apiUrl}/auth';

  // Esta função é usada para armazenar o usuário autenticado
  private userSubject = new BehaviorSubject<User | null>(null);

  // Observable para o usuário autenticado, que pode ser usado em outros componentes
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  // Processa o login do usuário, enviando as credenciais para a API e armazenando o token e as informações do usuário no localStorage
  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string, user: User }>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('suki_token', res.token);
        localStorage.setItem('suki_user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  // Logout do usuário, removendo o token e as informações do usuário do localStorage e redirecionando para a página de login
  logout(): void {
    localStorage.removeItem('suki_token');
    localStorage.removeItem('suki_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verifica se o usuário está autenticado, verificando a presença do token no localStorage
  private restoreSession(): void {
    const savedUser = localStorage.getItem('suki_user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  // Verifica se o usuário autenticado tem nível de administrador
  isAdmin(): boolean {
    const user = this.userSubject.value;
    return user?.nivel === 'admin';
  }
}
