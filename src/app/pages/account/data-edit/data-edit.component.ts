import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-data-edit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-edit.component.html',
  styleUrl: './data-edit.component.css'
})
export class DataEditComponent {
  isLoggedIn: boolean = true;
}
