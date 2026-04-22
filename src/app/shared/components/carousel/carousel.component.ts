import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // 1. Adicione este import

@Component({
  selector: 'app-carousel',
  standalone: true, // 2. Adicione esta linha
  imports: [CommonModule], // 3. Adicione esta linha
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [
    'assets/images/carousel/banner-1.webp',
    'assets/images/carousel/banner-2.webp',
    'assets/images/carousel/banner-3.webp'
  ];

  currentIndex = 0;
  offset = 8; // (100-80)/2 - 2 (Calculado a partir do seu JS original)
  slideInterval: any;

  ngOnInit() {
    this.resetInterval();
  }

  ngOnDestroy() {
    // Essencial no Angular para evitar vazamento de memória quando a tela muda
    clearInterval(this.slideInterval);
  }

  goToSlide(index: number) {
    const totalItems = this.images.length;
    this.currentIndex = (index + totalItems) % totalItems;

    // Lógica peek-a-boo do seu JS
    const itemVisiblePercent = 80;
    const itemMarginPercent = 2;
    const itemTotalSpacePercent = itemVisiblePercent + (itemMarginPercent * 2);
    const initialOffsetPercent = (100 - itemVisiblePercent) / 2 - itemMarginPercent;

    this.offset = initialOffsetPercent - (this.currentIndex * itemTotalSpacePercent);
  }

  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
    this.resetInterval();
  }

  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
    this.resetInterval();
  }

  resetInterval() {
    clearInterval(this.slideInterval);
    this.slideInterval = setInterval(() => this.nextSlide(), 4000);
  }
}