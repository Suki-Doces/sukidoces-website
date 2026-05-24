import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  // Dados da linha do tempo
  marcos = [
    {
      ano: '2020',
      titulo: 'O Início de um Sonho',
      texto: 'A Suki Doces nasceu da paixão por transformar clientes e pequenas empresas se sentirem experiências de sabor do nossos produtos. Nossas primeiras receitas foram feitas na cozinha de casa.'
    },
    {
      ano: '2023',
      titulo: 'Ganhando Corações',
      texto: 'Com o aumento da demanda e o carinho dos clientes, expandimos nossa produção e de negócios e começamos a fornecer doces artesanais e doces comprados direto da fábrica para eventos e comércios locais com melhor preço.'
    },
    {
      ano: 'Hoje',
      titulo: 'Doçura e Modernidade',
      texto: 'Hoje, aliamos nossa tradição artesanal a uma plataforma moderna, garantindo que nossos doces cheguem até você com a mesma qualidade e frescor de sempre.'
    }
  ];

  ngOnInit(): void {
    // Scrolla para o topo ao carregar a página
    window.scrollTo(0, 0);
  }
}
