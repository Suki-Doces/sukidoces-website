import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';

interface User {
  id: number;
  nome: string;
  email: string;
  nivel: 'admin' | 'cliente';
  cpf?: string;
  telefone?: string;
  endereco?: string | string[] | any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/usuario`;
  private userSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string, user: User }>(
      `${this.API_URL}/login`, credentials
    ).pipe(
      tap(res => {
        localStorage.setItem('suki_token', res.token);
        localStorage.setItem('suki_user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  loginAdmin(credentials: any): Observable<any> {
    return this.http.post<{ token: string, user: any }>(
      `${environment.apiUrl}/admin/login`, credentials
    ).pipe(
      tap(res => {
        localStorage.setItem('suki_token', res.token);

        // CORRIGIDO: era res.admin.id — backend retorna res.user, não res.admin
        const userFormatado: User = {
          id: res.user.id,
          nome: res.user.nome,
          email: res.user.email,
          nivel: 'admin'
        };

        localStorage.setItem('suki_user', JSON.stringify(userFormatado));
        this.userSubject.next(userFormatado);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('suki_token');
    localStorage.removeItem('suki_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  updateUserInStorage(updatedData: Partial<User>): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem('suki_user', JSON.stringify(newUser));
      this.userSubject.next(newUser);
    }
  }

  private restoreSession(): void {
    const savedUser = localStorage.getItem('suki_user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  isAdmin(): boolean {
    const user = this.userSubject.value;
    return user?.nivel === 'admin';
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('suki_token');
    const user = this.userSubject.value;

    // Retorna true se ambos existirem (está logado)
    return !!token && !!user;
  }

  registro(userData: any): Observable<any> {
    return this.http.post<{ token: string, user: User }>(
      `${this.API_URL}/registro`, userData
    ).pipe(
      tap(res => {
        localStorage.setItem('suki_token', res.token);
        localStorage.setItem('suki_user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }
}
