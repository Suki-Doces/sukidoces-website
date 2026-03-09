<head>
    <?php
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // CHECK FILE NAME & DEFINES THE DIRECTORY
    $nome_do_arquivo = basename($_SERVER['PHP_SELF']);
    function DirDetect(){
        global $nome_do_arquivo;
        if ($nome_do_arquivo == 'index.php') {
            echo'./';
        } elseif ($nome_do_arquivo == 'checkout.php' or $nome_do_arquivo == 'check_success.php' or $nome_do_arquivo == 'login.php' or $nome_do_arquivo == 'perfil.php') {
            echo'../../';
        } else{
            echo'../';
        }        
    }
    
    // (Lógica de nome permanece igual)
    $display_name = "Minha Conta";
    if (isset($_SESSION['user_nome'])) {
        $parts = explode(' ', trim($_SESSION['user_nome']));
        if (count($parts) > 1) {
            $display_name = $parts[0] . ' ' . end($parts);
        } else {
            $display_name = $parts[0];
        }
    }
    ?>
    <link rel="stylesheet" href="<?php DirDetect();?>components/header/header.css">
</head>
<body>
    <header>
        <a href="<?php DirDetect();?>">
            <img class="header-logo" src="<?php DirDetect();?>assets/images/suki-doces-logo.svg" alt="logo Suki Doces">
        </a>
        <nav class="hdr-desktop-view">
            <a href="<?php DirDetect();?>">Home</a>
            <a href="<?php DirDetect();?>pages/produtos.php">Produtos</a>
            <a href="<?php DirDetect();?>pages/sobre.php">História</a>
            <a href="#ftr-contacts">Contatos</a>
        </nav>
        
        <div class="hdr-desktop-view hdr-user-section">
            <form action="<?php DirDetect();?>pages/produtos.php" method="get" class="header-search-form"> 
                <input class="hdr-srch-f-plc-hldr" type="search" name="query" placeholder="O que você procura?" required>
                <button type="submit" aria-label="Pesquisar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>
            </form>

            <a class="header-btn" href="<?php DirDetect();?>/pages/carrinho.php">
                <button class="hdr-user-btn" aria-label="Carrinho de Compras">
                    <img src="<?php DirDetect();?>assets/icons/interface/cart-icon.svg" alt="Carrinho">
                    <p>Carrinho</p>
                </button>
            </a>

            <div class="header-btn">
                <button class="hdr-user-btn hdr-toggle-btn" data-target="hdr-profile-menu" aria-label="Abrir menu do perfil">
                    <img src="<?php DirDetect();?>assets/icons/interface/profile-icon.svg" alt="Perfil">
                    <p><?= htmlspecialchars($display_name) ?></p> 
                </button>

                <div id="hdr-profile-menu" class="hdr-user-dropdown">
                    <?php if(isset($_SESSION['user_id'])): ?>
                        <a class="hdr-pp-links" href="<?php DirDetect();?>pages/client/perfil.php">Meus Dados</a>
                        <hr>
                        <a class="hdr-pp-links" href="<?php DirDetect();?>pages/meus_pedidos.php">Pedidos</a>
                        <hr>
                        <a class="hdr-pp-links" href="<?php DirDetect();?>pages/conta/logout.php" style="color: #e9228f;">Sair</a>
                    <?php else: ?>
                        <a class="hdr-pp-links" href="<?php DirDetect();?>pages/conta/login.php">Entrar / Cadastrar</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </header>
    <script src="<?php DirDetect();?>components/header/header.js"></script>
</body>