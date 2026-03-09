<head>
    <script src="./components/carousel/carousel.js"></script>
    <link rel="stylesheet" href="./components/carousel/carousel.css">
</head>

<body>
    <!--CAROUSEL-->
    <div class="carousel-container">
        <!-- Container principal do carrossel -->
        <div id="carousel" class="carousel-wrapper">
            <!-- Slides do carrossel -->
            <div class="carousel-slide">
                <!-- Item 1 -->
                <div class="carousel-item">
                    <img src="./assets/carousel-images/banner-1.webp" alt="Imagem descritiva 1">
                </div>
                <!-- Item 2 -->
                <div class="carousel-item">
                    <img src="./assets/carousel-images/banner-2.webp" alt="Imagem descritiva 2">
                </div>
                <!-- Item 3 -->
                <div class="carousel-item">
                    <img src="./assets/carousel-images/banner-3.webp" alt="Imagem descritiva 3">
                </div>
                    <!-- Item 4 -->
                    <div class="carousel-item">
                    <img src="./assets/carousel-images/banner-4.webp" alt="Imagem descritiva 4">
                </div>
            </div>
            <!-- Botões de Navegação -->
            <button id="prevBtn" class="nav-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button id="nextBtn" class="nav-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
            <!-- Indicadores de Posição -->
            <div id="indicators" class="indicators-wrapper">
                <!-- Os indicadores serão gerados pelo JavaScript -->
            </div>
        </div>
    </div>
</body>