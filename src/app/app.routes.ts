import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/account/login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: '/', pathMatch: 'full' },
    { path: 'home', component: AppComponent, title: 'Home' },
    { path: 'login', component: LoginComponent, title: 'Login'}
];