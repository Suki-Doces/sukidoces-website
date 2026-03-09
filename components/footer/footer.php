<?php
// Garante que o banco de dados esteja disponível
require_once __DIR__ . '/../../database/database.php';

// Busca as categorias no banco de dados
try {
    // Limita a 7 para não quebrar o layout verticalmente, se desejar todas, remova o LIMIT
    $stmtCatFooter = $pdo->query("SELECT * FROM categorias ORDER BY nome ASC LIMIT 7");
    $categoriasFooter = $stmtCatFooter->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $categoriasFooter = [];
}
?>
<head>
    <link rel="stylesheet" href="<?php if(function_exists('DirDetect')) DirDetect();?>components/footer/footer.css">
</head>
<body>
    <footer>
        <section class="footer-info">
            <img src="<?php if(function_exists('DirDetect')) DirDetect();?>assets/images/suki-doces-logo.svg" alt="suki-logo">
            <div class="footer-list">
                <h2 class="f-h2">Informações</h2>
                <nav>
                    <a class="f-txt-w" href="<?php DirDetect();?>pages/sobre.php">Quem Somos</a>
                    <a class="f-txt-w" href="#">Nossa Loja</a>
                    <a class="f-txt-w" href="#">Termos e Condições</a>
                    <a class="f-txt-w" href="#">Política de Troca e Devolução</a>
                    <a class="f-txt-w" href="#">Label 5</a>
                </nav>
            </div>
            <div class="footer-list">
                <h2 class="f-h2">Categorias</h2>
                <nav>
                    <?php if (!empty($categoriasFooter)): ?>
                        <?php foreach ($categoriasFooter as $cat): ?>
                            <a class="f-txt-w" href="<?php if(function_exists('DirDetect')) DirDetect();?>pages/produtos.php?categoria=<?= $cat['id_categoria'] ?>">
                                <?= htmlspecialchars($cat['nome']) ?>
                            </a>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <a class="f-txt-w" href="#">Sem categorias</a>
                    <?php endif; ?>
                </nav>
            </div>
            <div class="footer-about" id="ftr-contacts">
                <div class="fa-topic">
                    <img src="<?php if(function_exists('DirDetect')) DirDetect();?>assets/icons/interface/location-pin-icon.svg" alt="ícone de mapa">
                    <p class="f-txt-w">Endereço: Rua Praça Castelo Branco, 365</p>
                </div>
                <div class="fa-topic">
                    <img src="<?php if(function_exists('DirDetect')) DirDetect();?>assets/icons/interface/phone-mob-icon.svg" alt="ícone de telefone">
                    <p class="f-txt-w">(11) 2759-8847</p>
                </div>
                <div class="fa-topic">
                    <img src="<?php if(function_exists('DirDetect')) DirDetect();?>assets/icons/interface/mail-icon.svg" alt="ícone de carta">
                    <p class="f-txt-w">E-mail: sukidoces@hotmail.com</p>
                </div>
                <div class="fa-topic">
                    <p class="f-txt-w">Siga-nos nas Redes:</p>
                    <a href="">
                        <img class="social-media-ico" src="<?php if(function_exists('DirDetect')) DirDetect();?>assets/icons/interface/facebook-icon.svg" alt="ícone de Facebook">
                    </a>
                    <a href="">
                        <img class="social-media-ico" src="<?php if(function_exists('DirDetect')) DirDetect();?>assets/icons/interface/instagram-icon.svg" alt="ìcone de Instagram">
                    </a>
                    <a href="">
                        <img class="social-media-ico" src="<?php if(function_exists('DirDetect')) DirDetect();?>assets/icons/interface/tiktok-icon.svg" alt="Ícone de Tiktok">
                    </a>
                </div>
            </div>
        </section>
        <p class="f-txt-w copyright-txt"><a href="">Suki Doces</a>. Todos os direitos reservados.</p>
    </footer>
</body>