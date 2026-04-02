import { Routes } from '@angular/router';
import { HomeComponent } from './pages/client/home/home.component';
import { LoginComponent } from './pages/client/account/login/login.component';
import { DataEditComponent } from './pages/client/account/data-edit/data-edit.component';
import { OrdersComponent } from './pages/client/account/orders/orders.component';
import { CartComponent } from './pages/client/cart/cart.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // First route to load
    { path: 'home', component: HomeComponent, title: 'Home' },
    { path: 'login', component: LoginComponent, title: 'Login'},
    { path: 'editar-dados', component: DataEditComponent, title: 'DadosPessoais'},
    { path: 'pedidos', component: OrdersComponent, title: 'Meus Pedidos'},
    { path: 'carrinho', component: CartComponent, title: 'Carrinho' },
    { path: '**', redirectTo: 'home' } // Last route to load, for 404 not found
];
