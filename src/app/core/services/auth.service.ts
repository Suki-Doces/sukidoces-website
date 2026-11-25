import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface User {
  id: number;
  nome: string;
  email: string;
  nivel: 'admin' | 'cliente';
  cpf?: string;
  telefone?: string;
  endereco?: string | string[] | any;
  foto_perfil?: string | null;
}

/** Resposta de login/registro do NestJS (`accessToken`; `token` é o mesmo valor, legado). */
export interface SessionResponse {
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user: User & { email_verificado?: boolean };
}

const TOKEN_KEY = 'suki_token';
const REFRESH_KEY = 'suki_refresh_token';
const USER_KEY = 'suki_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/usuario`;
  private userSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.userSubject.asObservable();

  /** Uma única renovação em andamento, compartilhada por todas as requisições que levaram 401. */
  private refreshInFlight: Observable<string> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(credentials: any): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(`${this.API_URL}/login`, credentials)
      .pipe(tap((res) => this.startSession(res, res.user.nivel)));
  }

  loginAdmin(credentials: any): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(`${environment.apiUrl}/admin/login`, credentials)
      .pipe(tap((res) => this.startSession(res, res.user.nivel)));
  }

  /**
   * Cria a conta. Se a API exigir confirmação de e-mail (`email_verificado: false`),
   * nenhuma sessão é aberta: o cliente precisa clicar no link recebido antes de entrar.
   */
  registro(userData: any): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.API_URL}/registro`, userData).pipe(
      tap((res) => {
        if (res.user?.email_verificado !== false) {
          this.startSession(res, res.user.nivel);
        }
      }),
    );
  }

  verificarEmail(token: string): Observable<unknown> {
    return this.http.get(`${this.API_URL}/verificar-email`, { params: { token } });
  }

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const accessToken = localStorage.getItem(TOKEN_KEY);
    if (refreshToken && accessToken) {
      // Revoga o refresh token no servidor (melhor esforço: a sessão local é limpa de qualquer forma).
      this.http
        .post(
          `${this.API_URL}/logout`,
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        .subscribe({ error: () => undefined });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRefreshToken(): boolean {
    return !!localStorage.getItem(REFRESH_KEY);
  }

  /** Troca o refresh token por um novo par (o refresh token do NestJS é de uso único). */
  refreshSession(): Observable<string> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('Sem refresh token'));
    }
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.http
        .post<{ accessToken: string; refreshToken: string }>(`${this.API_URL}/refresh`, {
          refreshToken,
        })
        .pipe(
          tap((pair) => {
            localStorage.setItem(TOKEN_KEY, pair.accessToken);
            localStorage.setItem(REFRESH_KEY, pair.refreshToken);
          }),
          map((pair) => pair.accessToken),
          finalize(() => (this.refreshInFlight = null)),
          shareReplay(1),
        );
    }
    return this.refreshInFlight;
  }

  updateUserInStorage(updatedData: Partial<User>): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      this.userSubject.next(newUser);
    }
  }

  isAdmin(): boolean {
    return this.userSubject.value?.nivel === 'admin';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY) && !!this.userSubject.value;
  }

  private startSession(res: SessionResponse, nivel: User['nivel']): void {
    const accessToken = res.accessToken ?? res.token;
    if (!accessToken) return;

    const user: User = {
      id: res.user.id,
      nome: res.user.nome,
      email: res.user.email,
      nivel,
      ...(res.user.foto_perfil !== undefined && { foto_perfil: res.user.foto_perfil }),
    };

    localStorage.setItem(TOKEN_KEY, accessToken);
    if (res.refreshToken) localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  private restoreSession(): void {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        this.userSubject.next(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
  }
}
