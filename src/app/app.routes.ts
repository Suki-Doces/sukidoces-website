import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/account/login/login.component';
import { CartComponent } from './pages/cart/cart.component';


export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // First route to load
    { path: 'home', component: HomeComponent, title: 'Home' },
    { path: 'login', component: LoginComponent, title: 'Login'},
    { path: 'carrinho', component: CartComponent, title: 'Carrinho' },
    { path: '**', redirectTo: 'home' } // Last route to load, for 404 not found
];