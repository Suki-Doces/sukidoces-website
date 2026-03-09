<?php
session_start();
// Define o caminho base se necessário, ou usa caminhos relativos padrão
require_once __DIR__ . '/../database/database.php';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sobre Nós - Suki Doces</title>
    
    <!-- Reutilizando CSS Global -->
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../components/header/header.css">
    <link rel="stylesheet" href="../components/footer/footer.css">
    <link rel="stylesheet" href="../components/hover-nav/hover-nav.css">
    
    <!-- CSS Específico da Página -->
    <link rel="stylesheet" href="./css/sobre.css">
    
    <!-- Fontes -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <?php 
    // HEADER COMPONENT
    require_once '../components/header/header.php'; 
    ?>

    <main class="about-main">
        
        <!-- Hero Section -->
        <section class="about-hero">
            <div class="hero-content">
                <h1>A Doçura que <span style="color: var(--color-1);">Conecta</span></h1>
                <p>Conheça a história por trás de cada pedaço de felicidade que entregamos.</p>
            </div>
        </section>

        <!-- A História -->
        <section class="story-section">
            <div class="story-container">
                <div class="story-text">
                    <h2>Nossa História</h2>
                    <p>
                        A <strong>Suki Doces</strong> nasceu de um sonho simples, mas poderoso: transformar pequenos momentos em memórias inesquecíveis através do paladar. 
                    </p>
                    <p>
                        Tudo começou na cozinha de casa, onde receitas de família eram testadas e aprimoradas com um toque de carinho e inovação. O nome "Suki" carrega o significado de "gostar" ou "amar", refletindo exatamente o sentimento que colocamos em cada receita.
                    </p>
                    <p>
                        Em 2024, decidimos que era hora de compartilhar essa paixão com o mundo. O que era apenas um hobby se tornou uma missão: levar doçura de qualidade, com ingredientes selecionados e um atendimento que faz você se sentir em casa.
                    </p>
                </div>
                <div class="story-image">
                    <!-- Reutilizando uma imagem do seu upload que remete a produção/doces -->
                    <img src="../assets/uploads/1764177561-69273699197fd.jpg" alt="Caixa de doces artesanais Suki">
                </div>
            </div>
        </section>

        <!-- Valores (Cards) -->
        <section class="values-section">
            <h2 class="section-title">Nossos Pilares</h2>
            <div class="values-grid">
                <div class="value-card">
                    <div class="icon-box">
                        <img src="../assets/icon/Star (Deluxe).svg" alt="Qualidade">
                    </div>
                    <h3>Qualidade Premium</h3>
                    <p>Utilizamos apenas ingredientes selecionados e chocolate nobre em todas as nossas produções.</p>
                </div>

                <div class="value-card">
                    <div class="icon-box">
                        <img src="../assets/icon/Green-Ball.svg" alt="Natural"> <!-- Reutilizando bola verde como símbolo de natural/fresco -->
                    </div>
                    <h3>Frescor Garantido</h3>
                    <p>Nossos doces são preparados diariamente para garantir a melhor experiência de sabor e textura.</p>
                </div>

                <div class="value-card">
                    <div class="icon-box">
                        <img src="../assets/icon/User - Icon.svg" alt="Cliente">
                    </div>
                    <h3>Foco em Você</h3>
                    <p>Mais do que vender doces, queremos criar laços. O seu sorriso ao provar é nossa maior recompensa.</p>
                </div>
            </div>
        </section>

        <!-- Call to Action -->
        <section class="cta-section">
            <div class="cta-content">
                <h2>Faça parte dessa história</h2>
                <p>Experimente nossos clássicos ou descubra novos sabores hoje mesmo.</p>
                <a href="produtos.php">
                    <button class="button-fill-icon">
                        <p>Ver Cardápio</p>
                        <img src="../assets/icons/interface/arrow-circle-f.svg" alt="Seta">
                    </button>
                </a>
            </div>
        </section>

    </main>

    <?php
    // FOOTER COMPONENT
    require_once '../components/footer/footer.php';
    // HOVER NAV
    require_once '../components/hover-nav/hover-nav.php';
    // VLIBRAS
    require_once '../components/vlibras-comp.php';
    ?>
</body>
</html>