import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { query } from 'express';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  displayName: string = 'Conta';
  searchQuery: string = '';

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        const parts = user.nome.trim().split(' ');
        this.displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0];
      } else {
        this.displayName = 'Conta';
      }
    });
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/produtos'], { queryParams: { query: this.searchQuery } });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isMenuOpen = false; // Opcional: garante que o menu feche ao sair
  }
}
