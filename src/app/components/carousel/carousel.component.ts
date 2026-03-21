import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule], // Necessário para usar o *ngFor e ngClass
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  // Lista de imagens movida para o componente
  images = [
    { src: '../../assets/images/carousel/banner-1.webp', alt: 'Imagem descritiva 1' },
    { src: '../../assets/images/carousel/banner-2.webp', alt: 'Imagem descritiva 2' },
    { src: '../../assets/images/carousel/banner-3.webp', alt: 'Imagem descritiva 3' },
    { src: '../../assets/images/carousel/banner-4.webp', alt: 'Imagem descritiva 4' }
  ];

  currentIndex = 0;
  slideInterval: any;

  ngOnInit() {
    // Inicia o carrossel quando o componente é carregado
    this.resetInterval();
  }

  ngOnDestroy() {
    // Limpa o intervalo quando o componente é destruído para evitar memory leaks
    this.clearInterval();
  }

  // Calcula o deslocamento do slider com base no index atual
  get transformStyle() {
    const itemVisiblePercent = 80;
    const itemMarginPercent = 2;
    const itemTotalSpacePercent = itemVisiblePercent + (itemMarginPercent * 2); // 84%
    const initialOffsetPercent = (100 - itemVisiblePercent) / 2 - itemMarginPercent; // 8%

    const offset = initialOffsetPercent - (this.currentIndex * itemTotalSpacePercent);
    return `translateX(${offset}%)`;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.resetInterval();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.resetInterval();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.resetInterval();
  }

  resetInterval() {
    this.clearInterval();
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  clearInterval() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
}