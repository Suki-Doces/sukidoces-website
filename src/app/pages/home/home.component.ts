import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { PromotionStoreComponent } from '../../components/promotion-store/promotion-store.component';
import { MarketingSectionComponent } from '../../components/contoured-section/marketing-section/marketing-section.component';
import { AdsFlavoursSectionComponent } from '../../components/ads-flavours-section/ads-flavours-section.component';
import { MarketingIceCreamSectionComponent } from '../../components/contoured-section/marketing-ice-cream-section/marketing-ice-cream-section.component';
import { ShortCatalogComponent } from '../../components/short-catalog/short-catalog.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HoverNavComponent } from '../../components/hover-nav/hover-nav.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CarouselComponent, PromotionStoreComponent, MarketingSectionComponent, ShortCatalogComponent, FooterComponent, AdsFlavoursSectionComponent, MarketingIceCreamSectionComponent, HoverNavComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
