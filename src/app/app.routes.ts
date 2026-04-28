import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// --- Importações da Área Pública (Loja) ---
import { HomeComponent } from './features/public/home/home.component';
import { ProductListComponent } from './features/public/shop/product-list/product-list.component';
import { ProductDetailComponent } from './features/public/shop/product-detail/product-detail.component';
import { CartComponent } from './features/public/cart/cart.component';
import { LoginComponent } from './features/public/auth/login/login.component';
import { ProfileComponent } from './features/public/user/profile/profile.component';

// Importações da Área Admin
import { AdminLayoutComponent } from './features/admin/layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
// 1. Importe a nova tela de Pedidos (que fizemos antes)
import { ListaPedidosComponent } from './features/admin/pedidos/lista-pedidos/lista-pedidos.component';
// 2. Importe a nova tela de Produtos (que acabamos de fazer)
import { ListaProdutosComponent } from './features/admin/produtos/lista-produtos/lista-produtos.component';
import { ListaNotificacoesComponent } from './features/admin/notificacoes/lista-notificacoes/lista-notificacoes.component';
export const routes: Routes = [
  // ==========================================
  // ROTAS PÚBLICAS (Suki Doces Website)
  // ==========================================
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'SukiDoces | Home' },
  { path: 'login', component: LoginComponent, title: 'SukiDoces | Login' },
  { path: 'produtos', component: ProductListComponent, title: 'SukiDoces | Produtos' },
  { path: 'produtos/:id', component: ProductDetailComponent, title: 'SukiDoces | Detalhes do Produto' },
  { path: 'carrinho', component: CartComponent, title: 'SukiDoces | Carrinho' },
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard], title: 'SukiDoces | Meu Perfil' }, // Rota protegida, só acessível com token válido

  // ==========================================
  // ROTAS DO PAINEL ADMIN (Suki Doces Admin)
  // ==========================================
  {
    path: 'admin',
    component: AdminLayoutComponent, 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Admin - Dashboard' },
      
      // Rota de Pedidos
      { path: 'pedidos', component: ListaPedidosComponent, title: 'Admin - Pedidos' },
      
      // Rota de Produtos 
      { path: 'produtos', component: ListaProdutosComponent, title: 'Admin - Produtos' },
      
      { path: 'admin/notificacoes', component: ListaNotificacoesComponent },

      // Rota de Categorias (A que acabamos de adicionar)
      { 
        path: 'categorias', 
        loadComponent: () => import('./features/admin/categorias/lista-categorias/lista-categorias.component').then(m => m.ListaCategoriasComponent), 
        title: 'Admin - Categorias' 
      } // A última não precisa de vírgula, mas não tem problema se tiver.
    ]
  },

  // ==========================================
  // ROTA CORINGA (Sempre por último!)
  // ==========================================
  // Qualquer URL que não bater com as de cima, cai aqui e volta pra home
  { path: '**', redirectTo: 'home' } 
];