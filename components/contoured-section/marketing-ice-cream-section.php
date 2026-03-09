<head>
    <link rel="stylesheet" href="./components/contoured-section/contoured-section.css">
    <style>
        .topic{
            display: flex;
            background: var(--color-5);
            width: 90%;
            max-width: 40rem;
            padding: 10px;
            border-radius: 10px;
            gap: 13px;
        }
        .ics-img{
            width: 25%;
            max-width: 100px;
            aspect-ratio: 1;
        }
        .ics-txt{
            width: 75%;
            padding: 10px;
            border-radius: 10px;
        }
        .ics-buttons{
            display: flex;
            gap: 10px
        }
        @media (min-width: 1050px){
            .topic{
            width: 75%;
            padding: 10px;
            }
        }
    </style>
</head>
<body>
    <!--Marketing Ice Cream-->
    <section class="ice-cream-section contoured-container">
        <h1>Não é somente doces. <span class="ics-highlight-txt">Sorvetes e muito mais!</span></h1>
        <div class="topic one">
            <img class="ics-img" src="./assets/images/img-strawberry.svg" alt="">
            <div class="ics-txt">
                <h2>Escolha seu sabor</h2>
                <p>Em nosso menu, você vai achar algo de seu agrado.</p>
            </div>
        </div>
        <div class="topic two">
            <img class="ics-img" src="./assets/images/img-ic.svg" alt="">
            <div class="ics-txt">
                <h2>Monte do seu jeito</h2>
                <p>Adicione coberturas, caldas e complemente como quiser. Seu sorvete, do seu jeito.</p>
            </div>
        </div>
        <div class="topic three">
            <img class="ics-img" src="./assets/images/ic-cream.svg" alt="">
            <div class="ics-txt">
                <h2>Compartilhe o sabor</h2>
                <p>Tire fotos, marque a gente e espalhe essa delicia nas redes sociais! #SaborSuki</p>
            </div>
        </div>
        <div class="ics-buttons">
            <button class="button-fill-icon">
                <p>Saiba mais</p>
                <img src="./assets/icons/interface/arrow-circle-f.svg" alt="">
            </button>
            <button class="button-fill-icon">
                <p>Nossos ingredientes</p>
                <img src="./assets/icons/interface/arrow-circle-f.svg" alt="">
            </button> 
        </div>
    </section>
</body>