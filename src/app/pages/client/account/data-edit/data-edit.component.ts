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


  message = {
    "id": 1,
    "text": "Alert! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos inventore quae ipsum a magni neque excepturi necessitatibus quod iure consequuntur repudiandae rerum, numquam ratione harum! Temporibus neque iusto a dolore?"
  }

  isLoggedIn: boolean = true;

}
