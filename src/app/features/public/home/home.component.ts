import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

//Components
import { AdsFlavoursSectionComponent } from 'src/app/shared/components/ads-flavours-section/ads-flavours-section.component';
import { CarouselComponent } from 'src/app/shared/components/carousel/carousel.component';
import { MarketingIceCreamSectionComponent } from 'src/app/shared/components/contoured-section/marketing-ice-cream-section/marketing-ice-cream-section.component';
import { MarketingSectionComponent } from 'src/app/shared/components/contoured-section/marketing-section/marketing-section.component';
import { PromotionStoreComponent } from 'src/app/shared/components/promotion-store/promotion-store.component';
import { ShortCatalogComponent } from 'src/app/shared/components/short-catalog/short-catalog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AdsFlavoursSectionComponent,
    CarouselComponent,
    MarketingIceCreamSectionComponent,
    MarketingSectionComponent,
    PromotionStoreComponent,
    ShortCatalogComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
