import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-short-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './short-catalog.component.html',
  styleUrl: './short-catalog.component.css'
})
export class ShortCatalogComponent implements OnInit {
  
  activeTab: 'mais-vendidos' | 'novos' = 'mais-vendidos';

  bestSellers: Product[] = [];
  newArrivals: Product[] = [];

  // Imagens
  readonly imageBaseUrl = 'assets/images/produtos/';
  readonly defaultImage = 'assets/images/default-product.png';

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    // Carrega duas listas paralelamente
    this.productService.getBestSellers().subscribe({
      next: (data) => this.bestSellers = data,
      error: (err) => console.error('Erro ao carregar mais vendidos:', err)
    });

    this.productService.getNewArrivals().subscribe({
      next: (data) => this.newArrivals = data,
      error: (err) => console.error('Erro ao carregar novos produtos:', err)
    });
  }

  // Tab
  setActiveTab(tab: 'mais-vendidos' | 'novos'): void {
    this.activeTab = tab;
  }

}
