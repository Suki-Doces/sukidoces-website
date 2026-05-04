import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const glassRouteAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    // 1. Apenas posiciona as telas uma sobre a outra para não quebrarem o fluxo
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',     // <-- ADICIONE ESTA LINHA: Trava a altura na medida exata da tela
        overflow: 'hidden',  // Corta qualquer conteúdo que tentar passar dessa altura
        display: 'block'
      })
    ], { optional: true }),
    
    // 2. Define o estado oculto/desfocado APENAS para quem está entrando
    query(':enter', [
      style({ opacity: 0, filter: 'blur(8px)' })
    ], { optional: true }),
    
    // 3. Executa a animação nas duas simultaneamente
    group([
      query(':leave', [
        animate('400ms ease-out', style({ opacity: 0, filter: 'blur(8px)' }))
      ], { optional: true }),
      
      query(':enter', [
        animate('400ms ease-in', style({ opacity: 1, filter: 'blur(0)' }))
      ], { optional: true })
    ])
  ])
]);