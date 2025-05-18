import request from 'supertest';
import crypto from 'crypto';
import { test, expect } from '@playwright/test';
import { config } from '../../configs/config';

const baseUrl = config.baseUrl!;
const apiKey = config.apiKey!;
const apiSecret = config.apiSecret!;
const symbol = 'BTCUSDT';

function sign(queryString: string) {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

function authHeaders() {
  return {
    'X-MBX-APIKEY': apiKey,
  };
}

test.describe('Limit Order & Balance Check', () => {
  let orderId: number;

  test('Place LIMIT BUY order', async () => {
  const timestamp = Date.now();
  const params = new URLSearchParams({
    symbol,
    side: 'BUY',
    type: 'LIMIT',
    timeInForce: 'GTC',
    quantity: '0.001',  // Sesuaikan dengan minimum market
    price: '30000',     // Gunakan harga wajar
    recvWindow: '5000',
    timestamp: timestamp.toString(),
  });

  const signature = sign(params.toString());
  params.append('signature', signature);

  const res = await request(baseUrl)
    .post('/api/v3/order')
    .set(authHeaders())
    .send(params.toString())
    .set('Content-Type', 'application/x-www-form-urlencoded');

  // Fix: Binance returns 200 for successful orders
  expect(res.status).toBe(200);
  orderId = res.body.orderId;
  console.log('Order ID:', orderId);
});

  test('Check Account Balance', async () => {
    const timestamp = Date.now();
    const params = new URLSearchParams({
      timestamp: timestamp.toString(),
    });
    const signature = sign(params.toString());
    params.append('signature', signature);

    const res = await request(baseUrl)
      .get(`/api/v3/account?${params.toString()}`)
      .set(authHeaders());

    expect(res.status).toBe(200);
    const balances = res.body.balances;
    const btcBalance = balances.find((b: any) => b.asset === 'BTC');
    expect(btcBalance).toBeDefined();
    console.log('BTC Balance:', btcBalance);
  });

  test.afterAll(async () => {
    if (!orderId) return;
    const timestamp = Date.now();
    const params = new URLSearchParams({
      symbol,
      orderId: orderId.toString(),
      timestamp: timestamp.toString(),
    });
    const signature = sign(params.toString());
    params.append('signature', signature);

    await request(baseUrl)
      .delete(`/api/v3/order?${params.toString()}`)
      .set(authHeaders());
  });
});
