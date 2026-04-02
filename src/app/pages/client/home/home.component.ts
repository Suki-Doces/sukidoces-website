import { Component } from '@angular/core';
import { CarouselComponent } from '../../../components/carousel/carousel.component';
import { PromotionStoreComponent } from '../../../components/promotion-store/promotion-store.component';
import { MarketingSectionComponent } from '../../../components/contoured-section/marketing-section/marketing-section.component';
import { AdsFlavoursSectionComponent } from '../../../components/ads-flavours-section/ads-flavours-section.component';
import { MarketingIceCreamSectionComponent } from '../../../components/contoured-section/marketing-ice-cream-section/marketing-ice-cream-section.component';
import { ShortCatalogComponent } from '../../../components/short-catalog/short-catalog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselComponent, PromotionStoreComponent, MarketingSectionComponent, ShortCatalogComponent, AdsFlavoursSectionComponent, MarketingIceCreamSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
