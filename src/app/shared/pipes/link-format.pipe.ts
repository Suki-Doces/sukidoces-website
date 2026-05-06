import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkFormat',
  standalone: true
})
export class LinkFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    // 1. Transforma o formato [Texto](Link) em uma tag <a> real
    const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/g;
    let formattedText = value.replace(markdownLinkRegex, '<a href="$2" class="chat-product-link">$1</a>');
    
    // 2. Transforma quebras de linha (\n) em tags <br> para manter os parágrafos do chat
    formattedText = formattedText.replace(/\n/g, '<br>');

    // 3. Diz ao Angular que esse HTML é seguro para ser exibido
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }
}