import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoryService } from 'src/app/core/services/category.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  categoriasFooter: any[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories(7).subscribe({
      next: (data) => this.categoriasFooter = data,
      error: (err) => console.error('Erro ao carregar categorias para o rodapé:', err)
    });
  }
}
