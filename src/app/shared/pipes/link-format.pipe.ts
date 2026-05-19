import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkFormat',
  standalone: true
})
export class LinkFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string): SafeHtml {
    if (!value) return '';

    let formattedText = value;

    // 1. NEGRITO (**texto**)
    // Substitui tudo o que estiver entre dois asteriscos duplos por <strong>
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="chat-bold">$1</strong>');

    // 2. LISTAS (* item ou - item)
    // O '\s*' no início permite que a IA coloque espaços antes do asterisco da lista
    // O '\s+' a seguir garante que tem de haver um espaço entre o asterisco e o texto (para não confundir com itálico)
    formattedText = formattedText.replace(/^\s*[\*|-]\s+(.*?)$/gm, '<li class="chat-list-item">$1</li>');

    // 4. Transforma o formato [Texto](Link) numa tag <a> real
    const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/g;
    formattedText = formattedText.replace(markdownLinkRegex, '<a href="$2" class="chat-product-link">$1</a>');

    // 5. Transforma as restantes quebras de linha (\n) em tags <br> para manter os parágrafos normais
    formattedText = formattedText.replace(/\n/g, '<br>');

    // 6. Diz ao Angular que este HTML é seguro para ser exibido
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }
}
