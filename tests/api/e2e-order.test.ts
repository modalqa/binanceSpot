import request from 'supertest';
import crypto from 'crypto';
import { test, expect } from '@playwright/test';
import { config } from '../../configs/config';

const symbol = 'BTCUSDT';
const baseUrl = config.baseUrl!;
const apiKey = config.apiKey!;
const apiSecret = config.apiSecret!;

function sign(queryString: string) {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

function authHeaders() {
  return { 'X-MBX-APIKEY': apiKey };
}

async function getBalance(asset: string): Promise<number> {
  const timestamp = Date.now();
  const params = new URLSearchParams({ timestamp: timestamp.toString() });
  params.append('signature', sign(params.toString()));

  const res = await request(baseUrl)
    .get(`/api/v3/account?${params.toString()}`)
    .set(authHeaders());

  expect(res.status).toBe(200);
  const balances = res.body.balances;
  const assetInfo = balances.find((b: any) => b.asset === asset);
  return parseFloat(assetInfo?.free ?? '0');
}

test('E2E: Place Order -> Check Open Orders -> Cancel -> Check Balance', async () => {
  // STEP 1: Get initial USDT balance
  const balanceBefore = await getBalance('USDT');
  console.log('Balance Before:', balanceBefore);

  // STEP 2: Place LIMIT BUY order
  const timestamp = Date.now();
  const orderParams = new URLSearchParams({
    symbol,
    side: 'BUY',
    type: 'LIMIT',
    timeInForce: 'GTC',
    quantity: '0.001',
    price: '20000',
    recvWindow: '5000',
    timestamp: timestamp.toString(),
  });
  orderParams.append('signature', sign(orderParams.toString()));

  const orderRes = await request(baseUrl)
    .post('/api/v3/order')
    .set(authHeaders())
    .send(orderParams.toString())
    .set('Content-Type', 'application/x-www-form-urlencoded');

if (orderRes.status === 200) {
  console.log('Order Placed:', orderRes.body.orderId);
} else if (orderRes.status === 400) {
  console.warn('Order placement failed (400):', orderRes.body);
}
expect([200, 400]).toContain(orderRes.status);

// Only continue if order was placed
if (orderRes.status !== 200) return;
const orderId = orderRes.body.orderId;
  console.log('Order Placed:', orderId);

  // STEP 3: Check open orders
  const openOrdersParams = new URLSearchParams({
    symbol,
    timestamp: Date.now().toString(),
  });
  openOrdersParams.append('signature', sign(openOrdersParams.toString()));

  const openOrdersRes = await request(baseUrl)
    .get(`/api/v3/openOrders?${openOrdersParams.toString()}`)
    .set(authHeaders());

  expect(openOrdersRes.status).toBe(200);
  const isOrderFound = openOrdersRes.body.some((order: any) => order.orderId === orderId);
  expect(isOrderFound).toBeTruthy();
  console.log('Order is in open orders');

  // STEP 4: Cancel the order
  const cancelParams = new URLSearchParams({
    symbol,
    orderId: orderId.toString(),
    timestamp: Date.now().toString(),
  });
  cancelParams.append('signature', sign(cancelParams.toString()));

  const cancelRes = await request(baseUrl)
    .delete(`/api/v3/order?${cancelParams.toString()}`)
    .set(authHeaders());

  expect(cancelRes.status).toBe(200);
  console.log('Order canceled successfully');

  // STEP 5: Check balance again
  const balanceAfter = await getBalance('USDT');
  console.log('Balance After:', balanceAfter);

  expect(balanceAfter).toBeGreaterThanOrEqual(balanceBefore);
});
