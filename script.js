document.addEventListener('DOMContentLoaded', function () {
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('indicators');

    let currentIndex = 0;
    const totalItems = carouselItems.length;
    let slideInterval;

    // Cria os indicadores de posição
    for (let i = 0; i < totalItems; i++) {
        const indicator = document.createElement('button');
        indicator.classList.add('indicator');
        indicator.addEventListener('click', () => {
            goToSlide(i);
            resetInterval();
        });
        indicatorsContainer.appendChild(indicator);
    }
    
    const indicators = indicatorsContainer.querySelectorAll('.indicator');

    function goToSlide(index) {
        // Garante que o índice esteja dentro dos limites
        currentIndex = (index + totalItems) % totalItems;

        // --- Nova lógica de cálculo para o efeito Peek-a-boo ---
        const itemVisiblePercent = 80;
        const itemMarginPercent = 2;
        const itemTotalSpacePercent = itemVisiblePercent + (itemMarginPercent * 2); // 84%
        
        // Calcula o deslocamento inicial para centralizar o primeiro item
        const initialOffsetPercent = (100 - itemVisiblePercent) / 2 - itemMarginPercent; // (100-80)/2 - 2 = 8%

        // Calcula o deslocamento final
        const offset = initialOffsetPercent - (currentIndex * itemTotalSpacePercent);
        carouselSlide.style.transform = `translateX(${offset}%)`;

        // Atualiza a classe 'active' para o item e o indicador
        carouselItems.forEach((item, i) => {
            item.classList.toggle('active', i === currentIndex);
        });
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentIndex);
        });
    }

    // Funções de navegação
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // Reinicia o intervalo de slide automático
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 4000);
    }

    // Event Listeners para os botões
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    // Inicia o carrossel
    goToSlide(0);
    resetInterval();
});