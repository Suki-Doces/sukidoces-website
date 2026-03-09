<?php
// Pega o nome do arquivo atual (ex: "pedidos.php")
$current_page = basename($_SERVER['PHP_SELF']);
?>

<!-- Sidebar parcial (somente markup). Não inclui <head> nem links de CSS para evitar duplicação -->
<aside class="sidebar">
    <header class="sidebar-header">
        <a href="#" class="header-logo">
            <img src="<?= BASE_URL ?>/assets/icon/Logo Suki.svg" alt="Logo Suki">
        </a>
        <button class="toggler sidebar-toggler">
            <span class="material-symbols-rounded">chevron_left</span>
        </button>
        <button class="toggler menu-toggler">
            <span class="material-symbols-rounded">menu</span>
        </button>
    </header>

    <nav class="sidebar-nav">
        <ul class="nav-list primary-nav">
            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/dashboard/painel_admin.php" class="nav-link <?= ($current_page == 'painel_admin.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">dashboard</span>
                    <span class="nav-label">Painel</span>
                </a>
            </li>

            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/order/pedidos.php" class="nav-link <?= ($current_page == 'pedidos.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">calendar_today</span>
                    <span class="nav-label">Pedidos</span>
                </a>
            </li>

            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/notification/notificacoes.php" class="nav-link <?= ($current_page == 'notificacoes.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">notifications</span>
                    <span class="nav-label">Notificações</span>
                </a>
            </li>

            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/client/clientes.php" class="nav-link <?= ($current_page == 'clientes.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">group</span>
                    <span class="nav-label">Clientes</span>
                </a>
            </li>

            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/product/produtos.php" class="nav-link <?= ($current_page == 'produtos.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">analytics</span>
                    <span class="nav-label">Produtos</span>
                </a>
            </li>

            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/storage/estoque.php" class="nav-link <?= ($current_page == 'estoque.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">star</span>
                    <span class="nav-label">Estoque</span>
                </a>
            </li>

            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/settings/configuracoes.php" class="nav-link <?= ($current_page == 'configuracoes.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">settings</span>
                    <span class="nav-label">Configurações</span>
                </a>
            </li>
        </ul>

        <ul class="nav-list secondary-nav">
            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/client/perfil.php" class="nav-link <?= ($current_page == 'perfil.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">account_circle</span>
                    <span class="nav-label">Perfil</span>
                </a>
            </li>

            <li class="nav-item">
                <a href="<?= BASE_URL ?>/pages/conta/logout.php" class="nav-link <?= ($current_page == 'contaSuki.php') ? 'active' : '' ?>">
                    <span class="nav-icon material-symbols-rounded">logout</span>
                    <span class="nav-label">Logout</span>
                </a>
            </li>
        </ul>
    </nav>
    </aside>

