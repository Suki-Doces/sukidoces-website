import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { ProductListComponent } from './features/public/shop/product-list/product-list.component';
import { ProductDetailComponent } from './features/public/shop/product-detail/product-detail.component';
import { CartComponent } from './features/public/cart/cart.component';
import { LoginComponent } from './features/public/auth/login/login.component';

// Exemplo de uma página futura de pedidos
// import { MyOrdersComponent } from './features/public/user/my-orders/my-orders.component';

export const routes: Routes = [
    // --- Rotas Públicas ---
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // First route to load
    { path: 'home', component: HomeComponent, title: 'Home' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'produtos', component: ProductListComponent, title: 'Produtos' },
    { path: 'produtos/:id', component: ProductDetailComponent, title: 'Detalhes do Produto' },
    { path: 'carrinho', component: CartComponent, title: 'Carrinho' },
    { path: '**', redirectTo: 'home' } // Last route to load, for 404 not found
];

// --- Rotas Protegidas ---
/*
{ 
  path: 'meus-pedidos', 
  component: MyOrdersComponent,
  canActivate: [authGuard] // O Angular barra o acesso aqui se não tiver token!
}
*/
