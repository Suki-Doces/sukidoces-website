import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Services
import { Title } from '@angular/platform-browser';
import { CartService } from 'src/app/core/services/cart.service';
import { Product, ProductService } from 'src/app/core/services/product.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  isLoading: boolean = true;

  readonly defaultImage = `assets/images/produtos/default-product.svg`;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // I - Escuta (subscreve) continuamente as mudanças na URL em vez de tirar apenas um snapshot
    this.route.paramMap.subscribe(params => {

      const idParam = params.get('id');
      const id = idParam ? parseInt(idParam, 10) : null;

      if (!id) {
        // Se não houver ID válido, redireciona para a página de produtos
        this.router.navigate(['/produtos']);
        return;
      }

      // Reinicia o estado de loading e a quantidade caso o utilizador esteja a mudar de produto
      this.isLoading = true;
      this.quantity = 1;

      // II - Busca o NOVO produto na API sempre que o ID na URL mudar
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
          this.titleService.setTitle(`SukiDoces | ${this.product?.nome}`);
        },
        error: (err) => {
          console.error('Erro ao carregar produto:', err);
          this.router.navigate(['/produtos']); // Redireciona para a página de produtos em caso de erro
        }
      });

    });
  }

  // III - Retorna a URL completa da imagem do produto ou a imagem padrão se não houver
  getProductImage(imageURL: string | null): string {
    if (!imageURL) {
      return this.defaultImage;
    }

    if (imageURL.startsWith('http')) {
      return imageURL; // URL completa já fornecida pela API
    }

    return this.defaultImage;
  }

  // IV - Incrementa e decrementa a quantidade
  increment(): void {
    if (this.product && this.quantity < this.product.quantidade) {
      this.quantity++;
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // NOVO: Método para lidar com a digitação direta no input
  onQuantityChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let newQuantity = parseInt(inputElement.value, 10);

    // Se o utilizador apagar tudo ou digitar texto/negativo, forçamos para 1
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    // Se digitar um valor maior que o estoque, travamos no valor máximo do estoque
    else if (this.product && newQuantity > this.product.quantidade) {
      newQuantity = this.product.quantidade;
      this.notificationService.showError(
        'Limite Atingido',
        `Temos apenas ${this.product.quantidade} unidades em estoque.`
      );
    }

    this.quantity = newQuantity;
    // Força a atualização do valor visual no HTML caso o utilizador tenha digitado algo inválido
    inputElement.value = this.quantity.toString();
  }

  // V - Adiciona o produto ao carrinho (agora conectado ao banco de dados via Service)
  addToCart(): void {
    if (this.product && this.product.quantidade > 0) {

      // 1. Verifica quantos itens deste produto JÁ ESTÃO no carrinho
      const currentQtyInCart = this.cartService.getItemQuantity(this.product.id_produto);

      // 2. Valida se o que ele quer adicionar + o que já tem ultrapassa o estoque total
      if (currentQtyInCart + this.quantity > this.product.quantidade) {
        this.notificationService.showError(
          'Estoque Insuficiente',
          `Você já tem ${currentQtyInCart} no carrinho. Temos apenas ${this.product.quantidade} unidades disponíveis de ${this.product.nome}.`
        );
        return; // Interrompe a função aqui
      }

      // Chama o serviço que envia o POST para o Node.js
      this.cartService.addToCart(this.product, this.quantity);

      // Exibe o Toast de sucesso
      this.notificationService.showSuccess(
        'Adicionado ao Carrinho',
        `O item ${this.product.nome} já está aguardando você no carrinho.`
      );

      // (Opcional) Reseta o contador para 1 após o cliente adicionar o item
      this.quantity = 1;
    }
  }
}
