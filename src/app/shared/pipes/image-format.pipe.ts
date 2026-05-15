import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageFormat',
  standalone: true
})
export class ImageFormatPipe implements PipeTransform {
  
  // URL da tua API no Render (muda se for diferente)
  private readonly apiUrl = 'https://suki-doces-api.onrender.com'; 

  transform(imagem: string | undefined | null): string {
    // 1. Se não houver imagem, devolve uma imagem padrão de erro/placeholder
    if (!imagem) {
      return 'assets/images/produtos/default-product.svg'; 
    }

    // 2. Se a imagem já vier com "http" (Cloudinary), devolve o link exato!
    if (imagem.startsWith('http')) {
      return imagem;
    }

    // 3. Se for apenas o nome (Produtos antigos locais), junta com a URL da API
    return `${this.apiUrl}/imagens/${imagem}`;
  }
}
