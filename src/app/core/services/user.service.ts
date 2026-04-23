import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environments.development";

export interface UserProfile {
    id_usuario: number;
    nome: string;
    email: string;
    telefone?: string;
    endereco?: string;
    tipo_usuario: 'admin' | 'cliente';
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly API_URL = `${environment.apiUrl}/usuario`;

    constructor(private http: HttpClient) {}

    // Token
    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.API_URL}/perfil`);
    }

    updateProfile(profileData: Partial<UserProfile>): Observable<any> {
        return this.http.put(`${this.API_URL}/perfil`, profileData);
    }
}