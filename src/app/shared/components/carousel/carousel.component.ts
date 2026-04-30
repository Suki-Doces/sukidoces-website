import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Necessário para os links dos produtos

// Importação dos serviços e environment
import { ProductService, Product } from 'src/app/core/services/product.service';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule], // Adicionado RouterModule
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  products: Product[] = []; // Alterado de string[] para Product[]
  
  currentIndex = 0;
  offset = 18; 
  slideInterval: any;

  readonly defaultImage = 'assets/images/produtos/default-product.svg';

  // Injetando o serviço de produtos
  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadSmartBanners();
  }

  ngOnDestroy() {
    clearInterval(this.slideInterval);
  }

  loadSmartBanners() {
    // Busca os mais vendidos para gerar os banners dinamicamente
    this.productService.getProducts().subscribe({
      next: (data) => {
        // Pega no máximo 5 produtos de forma inteligente
        this.products = data.slice(0, 5);
        if (this.products.length > 0) {
          this.resetInterval();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar banners do carrossel:', err);
      }
    });
  }

  // Método para tratar as imagens (igual ao do product-list)
  getProductImage(imageURL: string | null): string {
    if (!imageURL) return this.defaultImage;
    if (imageURL.startsWith('http')) return imageURL;
    return `${environment.productImgUrl}${imageURL}`;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

  goToSlide(index: number) {
    const totalItems = this.products.length; // Agora usa o tamanho do array de produtos
    if (totalItems === 0) return;

    this.currentIndex = (index + totalItems) % totalItems;

    const itemVisiblePercent = 60;
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
    this.slideInterval = setInterval(() => this.nextSlide(), 4500); // Aumentei levemente para dar tempo de ler o preço
  }
}