import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// --- Importações da Área Pública (Loja) ---
import { HomeComponent } from './features/public/home/home.component';
import { ProductListComponent } from './features/public/shop/product-list/product-list.component';
import { ProductDetailComponent } from './features/public/shop/product-detail/product-detail.component';
import { CartComponent } from './features/public/cart/cart.component';
import { LoginComponent } from './features/public/auth/login/login.component';
import { ProfileComponent } from './features/public/user/profile/profile.component';
import { CheckoutComponent } from './features/public/checkout/checkout.component';

// Importações da Área Admin
import { AdminLayoutComponent } from './features/admin/layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
// 1. Importe a nova tela de Pedidos (que fizemos antes)
import { ListaPedidosComponent } from './features/admin/pedidos/lista-pedidos/lista-pedidos.component';
// 2. Importe a nova tela de Produtos (que acabamos de fazer)
import { ListaProdutosComponent } from './features/admin/produtos/lista-produtos/lista-produtos.component';
import { ControleEstoqueComponent } from './features/admin/estoque/controle-estoque/controle-estoque.component';
import { ListaClientesComponent } from './features/admin/clientes/lista-clientes/lista-clientes.component';
import { PainelConfiguracoesComponent } from './features/admin/configuracoes/painel-configuracoes/painel-configuracoes.component';
import { ListaNotificacoesComponent } from './features/admin/notificacoes/lista-notificacoes/lista-notificacoes.component';
export const routes: Routes = [
  // ==========================================
  // ROTAS PÚBLICAS (Suki Doces Website)
  // ==========================================
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'SukiDoces | Home' },
  { path: 'login', component: LoginComponent, title: 'SukiDoces | Login' },
  { path: 'produtos', component: ProductListComponent, title: 'SukiDoces | Produtos' },
  { path: 'produtos/:id', component: ProductDetailComponent, title: 'SukiDoces | ...' },
  { path: 'carrinho', component: CartComponent, title: 'SukiDoces | Carrinho' },
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard], title: 'SukiDoces | Meu Perfil' }, // Rota protegida, só acessível com token válido
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard], title: 'SukiDoces | Checkout' }, // Rota protegida, só acessível com token válido
  // ==========================================
  // ROTAS DO PAINEL ADMIN (Suki Doces Admin)
  // ==========================================
  {
    path: 'admin',
    component: AdminLayoutComponent, 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'SukiAdm | Dashboard' },
      
      // Rota de Pedidos
      { path: 'pedidos', component: ListaPedidosComponent, title: 'SukiAdm | Pedidos' },
      
      // Rota de Produtos 
      { path: 'produtos', component: ListaProdutosComponent, title: 'SukiAdm | Produtos' },
      
      { path: 'notificacoes', component: ListaNotificacoesComponent, title: 'SukiAdm | Notificações' },

      { path: 'clientes', component: ListaClientesComponent, title: 'SukiAdm | Clientes' },

      { path: 'estoque', component: ControleEstoqueComponent, title: 'SukiAdm | Estoque' },

      { path: 'configuracoes', component: PainelConfiguracoesComponent },

      // Rota de Categorias (A que acabamos de adicionar)
      { 
        path: 'categorias', 
        loadComponent: () => import('./features/admin/categorias/lista-categorias/lista-categorias.component').then(m => m.ListaCategoriasComponent), 
        title: 'SukiAdm | Categorias' 
      } // A última não precisa de vírgula, mas não tem problema se tiver.
    ]
  },

  // ==========================================
  // ROTA CORINGA (Sempre por último!)
  // ==========================================
  // Qualquer URL que não bater com as de cima, cai aqui e volta pra home
  { path: '**', redirectTo: 'home' } 
];