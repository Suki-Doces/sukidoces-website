<head>
    <link rel="stylesheet" href="<?php DirDetect();?>components/hover-nav/hover-nav.css">
    <?php
    function HoverNavFirst(){ // Esta funcao decide o primeiro item do Hover Nav
        global $nome_do_arquivo;
        if ($nome_do_arquivo == 'index.php'): ?>
        <!-- Item 1: Link Direto (Produtos) -->
        <a class="hnv-a-btn" href="<?php DirDetect();?>pages/produtos.php" aria-label="Produtos">
            <button class="hnv-button">
                <img src="<?php DirDetect();?>assets/icons/interface/store-shop-icon.svg" alt="home">
                <p>Produtos</p>
            </button>
        </a>
        <?php else: ?>
        <!-- Item 1: Link Direto (Home) -->
        <a class="hnv-a-btn" href="<?php DirDetect();?>" aria-label="Página Inicial">
            <button class="hnv-button">
                <img src="<?php DirDetect();?>assets/icons/interface/home-button.svg" alt="home">
                <p>Home</p>
            </button>
        </a>
        <?php endif;
    }?>
</head>
<body>
    <!-- HOVER NAV -->
    <nav class="hover-nav">
        
        <!-- Item 1: Link Direto (Home) -->
        <?php HoverNavFirst(); ?>
        
        <!-- Item 2: Dropdown (Pesquisa) -->
        <div class="hnv-button-wrapper">
            <button class="hnv-button hnv-toggle-btn" data-target="search-menu" aria-label="Abrir pesquisa">
                <img src="<?php DirDetect();?>assets/icons/interface/search-icon.svg" alt="search">
                <p>Procurar</p>
            </button>
            
            <!-- Painel Flutuante -->
            <div id="search-menu" class="hnv-dropdown hnv-search-panel">
                <form action="<?php DirDetect();?>pages/produtos.php" method="get" class="hnv-search-form"> 
                    <input type="search" name="query" placeholder="O que você procura?" required>
                    <button type="submit" aria-label="Pesquisar">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
        
        <!-- Item 3: Link Direto (Carrinho) -->
        <a class="hnv-a-btn" href="<?php DirDetect();?>/pages/carrinho.php" aria-label="Carrinho de Compras">
            <button class="hnv-button">
                <img src="<?php DirDetect();?>assets/icons/interface/cart-icon.svg" alt="cart">
                <p>Carrinho</p>
            </button>
        </a>
        
        <!-- Item 4: Dropdown (Perfil) -->
        <div class="hnv-button-wrapper">
            <button class="hnv-button hnv-toggle-btn" data-target="profile-menu" aria-label="Abrir menu do perfil">
                <img src="<?php DirDetect();?>assets/icons/interface/profile-icon.svg" alt="profile">
                <p><?= $display_name ?></p>
            </button>

            <!-- Painel Flutuante -->
            <div id="profile-menu" class="hnv-dropdown hnv-profile-panel">
                <?php if(isset($_SESSION['user_id'])): ?>
                    <a class="hnv-pp-links" href="<?php DirDetect();?>pages/client/perfil.php">Meus Dados</a>
                    <hr>
                    <a class="hnv-pp-links" href="<?php DirDetect();?>pages/meus_pedidos.php">Pedidos</a>
                    <hr>
                    <a class="hnv-pp-links" href="<?php DirDetect();?>pages/conta/logout.php" style="color: #e9228f;">Sair</a>
                <?php else: ?>
                    <a class="hnv-pp-links" href="<?php DirDetect();?>pages/conta/login.php">Entrar / Cadastrar</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>
    <script src="<?php DirDetect();?>components/hover-nav/hover-nav.js"></script>
</body>