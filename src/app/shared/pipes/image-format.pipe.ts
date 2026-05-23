import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageFormat',
  standalone: true
})
export class ImageFormatPipe implements PipeTransform {
  private readonly defaultImage = 'assets/images/produtos/default-product.svg';

  transform(imagem: string | undefined | null): string {
    if (!imagem) {
      return this.defaultImage;
    }

    if (imagem.startsWith('http')) {
      return imagem;
    }

    return this.defaultImage;
  }
}
