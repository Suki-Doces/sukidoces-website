import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from 'src/environments/environment';
import { apiResponseInterceptor, unwrapEnvelope } from './api-response.interceptor';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';

const API = environment.apiUrl;

describe('Integração do site com a API NestJS', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiResponseInterceptor, authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
  });

  describe('unwrapEnvelope', () => {
    it('remove o envelope { success, message, data }', () => {
      expect(unwrapEnvelope({ success: true, message: 'ok', data: [1, 2] })).toEqual([1, 2]);
    });

    it('mantém respostas sem envelope (pedidos, login) como vieram', () => {
      const pedido = { mensagem: 'Pedido realizado com sucesso!', pedido: { id_pedido: 1 } };
      expect(unwrapEnvelope(pedido)).toBe(pedido);
      expect(unwrapEnvelope([{ id_pedido: 1 }])).toEqual([{ id_pedido: 1 }]);
      expect(unwrapEnvelope({ success: true, message: 'Cart emptied successfully' })).toEqual({
        success: true,
        message: 'Cart emptied successfully',
      });
    });
  });

  it('entrega aos componentes só o data e identifica o site como canal "web"', () => {
    let categorias: unknown;
    http.get(`${API}/produtos/categorias`).subscribe((res) => (categorias = res));

    const req = backend.expectOne(`${API}/produtos/categorias`);
    expect(req.request.headers.get('X-Client-Platform')).toBe('web');
    req.flush({ success: true, message: 'Categories loaded', data: [{ id_categoria: 1, nome: 'Doces' }] });

    expect(categorias).toEqual([{ id_categoria: 1, nome: 'Doces' }]);
  });

  it('não envia token nem cabeçalhos da API para serviços externos (ViaCEP)', () => {
    localStorage.setItem('suki_token', 'abc');
    http.get('https://viacep.com.br/ws/01001000/json/').subscribe();
    const req = backend.expectOne('https://viacep.com.br/ws/01001000/json/');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.headers.has('X-Client-Platform')).toBeFalse();
    req.flush({});
  });

  it('copia message (inclusive lista de validação) para mensagem nos erros', () => {
    let erro: HttpErrorResponse | undefined;
    http.post(`${API}/pedidos`, {}).subscribe({ error: (e) => (erro = e) });
    backend
      .expectOne(`${API}/pedidos`)
      .flush(
        { statusCode: 400, message: ['quantity must be greater than zero'], error: 'Bad Request' },
        { status: 400, statusText: 'Bad Request' },
      );
    expect(erro?.status).toBe(400);
    expect(erro?.error.mensagem).toBe('quantity must be greater than zero');
  });

  it('renova o access token vencido com o refresh token e repete a requisição', () => {
    localStorage.setItem('suki_token', 'velho');
    localStorage.setItem('suki_refresh_token', 'refresh-1');

    let pedidos: unknown;
    http.get(`${API}/usuario/pedidos`).subscribe((res) => (pedidos = res));

    const first = backend.expectOne(`${API}/usuario/pedidos`);
    expect(first.request.headers.get('Authorization')).toBe('Bearer velho');
    first.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

    const refresh = backend.expectOne(`${API}/usuario/refresh`);
    expect(refresh.request.body).toEqual({ refreshToken: 'refresh-1' });
    expect(refresh.request.headers.has('Authorization')).toBeFalse();
    refresh.flush({
      success: true,
      message: 'Token refreshed successfully',
      data: { token: 'novo', accessToken: 'novo', refreshToken: 'refresh-2' },
    });

    const retry = backend.expectOne(`${API}/usuario/pedidos`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer novo');
    retry.flush([{ id_pedido: 7, origem: 'mobile' }]);

    expect(pedidos).toEqual([{ id_pedido: 7, origem: 'mobile' }]);
    expect(localStorage.getItem('suki_token')).toBe('novo');
    expect(localStorage.getItem('suki_refresh_token')).toBe('refresh-2');
  });

  it('login guarda accessToken, refreshToken e o nível do usuário', () => {
    const auth = TestBed.inject(AuthService);
    auth.login({ email: 'a@b.com', senha: 'senha123' }).subscribe();
    backend.expectOne(`${API}/usuario/login`).flush({
      message: 'Login successful',
      token: 'tk',
      accessToken: 'tk',
      refreshToken: 'rt',
      user: { id: 3, nome: 'Ana', email: 'a@b.com', nivel: 'cliente' },
    });
    expect(localStorage.getItem('suki_token')).toBe('tk');
    expect(localStorage.getItem('suki_refresh_token')).toBe('rt');
    expect(auth.isLoggedIn()).toBeTrue();
    expect(auth.isAdmin()).toBeFalse();
  });

  it('cadastro com verificação de e-mail pendente não abre sessão', () => {
    const auth = TestBed.inject(AuthService);
    auth.registro({ nome: 'Ana', email: 'a@b.com', senha: 'senha123', telefone: '11999999999' }).subscribe();
    backend.expectOne(`${API}/usuario/registro`).flush({
      message: 'User created successfully',
      accessToken: 'tk',
      refreshToken: 'rt',
      user: { id: 3, nome: 'Ana', email: 'a@b.com', nivel: 'cliente', email_verificado: false },
    });
    expect(auth.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('suki_token')).toBeNull();
  });

  it('checkout envia Idempotency-Key e reaproveita a chave informada', () => {
    const orders = TestBed.inject(OrderService);
    orders.createOrder([{ id_produto: 1, quantidade: 2 }], 'pix', undefined, 'chave-fixa').subscribe();
    const req = backend.expectOne(`${API}/pedidos`);
    expect(req.request.headers.get('Idempotency-Key')).toBe('chave-fixa');
    expect(req.request.body).toEqual({ produtos: [{ id_produto: 1, quantidade: 2 }], metodo_pagamento: 'pix' });
    req.flush({ mensagem: 'ok', pedido: { id_pedido: 1 } });

    orders.createOrder([{ id_produto: 1, quantidade: 1 }], 'pix').subscribe();
    const gerada = backend.expectOne(`${API}/pedidos`);
    expect(gerada.request.headers.get('Idempotency-Key')).toBeTruthy();
    gerada.flush({ mensagem: 'ok', pedido: { id_pedido: 2 } });
  });

  it('checkout envia o destino da entrega: o frete é calculado e gravado pelo servidor', () => {
    const orders = TestBed.inject(OrderService);
    orders
      .createOrder([{ id_produto: 1, quantidade: 1 }], 'pix', undefined, 'chave-2', {
        estado: 'SP',
        cidade: 'Diadema'
      })
      .subscribe();
    const req = backend.expectOne(`${API}/pedidos`);
    expect(req.request.body.endereco_entrega).toEqual({ estado: 'SP', cidade: 'Diadema' });
    // O site não manda valor de frete nem total: o servidor decide.
    expect(req.request.body.frete).toBeUndefined();
    expect(req.request.body.valor_total).toBeUndefined();
    req.flush({ mensagem: 'ok', pedido: {} });
  });

  it('atualização de status do admin usa a rota e o corpo do NestJS', () => {
    TestBed.inject(OrderService).updateOrderStatus(5, 'enviado').subscribe();
    const req = backend.expectOne(`${API}/pedidos/5/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'enviado' });
    req.flush({ mensagem: 'Status atualizado para enviado', pedido: { id_pedido: 5 } });
  });
});
