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
  private readonly API_URL = `${environment.apiUrl}/usuario`;

  // Esta função é usada para armazenar o usuário autenticado
  private userSubject = new BehaviorSubject<User | null>(null);

  // Observable para o usuário autenticado, que pode ser usado em outros componentes
  currentUser$ = this.userSubject.asObservable();
  isLoggedIn$: any;

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

  loginAdmin(credentials: any): Observable<any> {
    // Substitua '/admin/login' pelo caminho correto que você configurou no seu admin.routes.js
    return this.http.post<{ token: string, admin: any }>(`${environment.apiUrl}/admin/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('suki_token', res.token);
        // O backend do loginAdmin envia "admin" e não "user", então precisamos padronizar:
        const userFormatado: User = {
          id: res.admin.id,
          nome: res.admin.nome,
          email: res.admin.email,
          nivel: 'admin'
        };
        localStorage.setItem('suki_user', JSON.stringify(userFormatado));
        this.userSubject.next(userFormatado);
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

  // Atualiza os dados do usuário no localStorage e no BehaviorSubject
  updateUserInStorage(updatedData: Partial<User>): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      // Mescla os dados antigos com os novos
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem('suki_user', JSON.stringify(newUser));
      this.userSubject.next(newUser);
    }
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

  // Método de Cadastro
  registro(userData: any): Observable<any> {
    return this.http.post<{ token: string, user: User }>(`${this.API_URL}/registro`, userData)
      .pipe(
        tap(res => {
          // Já faz o login automaticamente após cadastrar
          localStorage.setItem('suki_token', res.token);
          localStorage.setItem('suki_user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        })
      );
  }
}
