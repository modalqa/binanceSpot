import request from 'supertest';
import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import { config } from '../../configs/config';

const recvWindow = 5000;

function signQuery(query: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(query).digest('hex');
}

function authHeaders() {
  return {
    'X-MBX-APIKEY': config.apiKey,
  };
}

test('Place LIMIT order and check balance', async () => {
  const timestamp = Date.now();
  const orderData = `symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&quantity=0.001&price=20000&recvWindow=${recvWindow}&timestamp=${timestamp}`;
  if (!config.apiSecret) {
    throw new Error('API secret is not defined');
  }
  const signature = signQuery(orderData, config.apiSecret);

  // PLACE LIMIT ORDER
  const placeOrder = await request(config.baseUrl)
    .post(`/api/v3/order?${orderData}&signature=${signature}`)
    .set(authHeaders());

  if (placeOrder.status === 201) {
    console.log('Order placed successfully with status 201:', placeOrder.body);
  } else if (placeOrder.status === 400) {
    console.log('Order placement failed with status 400:', placeOrder.body);
  }
  
  expect([201, 400]).toContain(placeOrder.status);
  console.log('Order response:', placeOrder.body);

  // GET BALANCE
  const ts2 = Date.now();
  const accountQuery = `recvWindow=${recvWindow}&timestamp=${ts2}`;
  if (!config.apiSecret) {
    throw new Error('API secret is not defined');
  }
  const sig2 = signQuery(accountQuery, config.apiSecret);

  const balanceRes = await request(config.baseUrl)
    .get(`/api/v3/account?${accountQuery}&signature=${sig2}`)
    .set(authHeaders());

  expect(balanceRes.status).toBe(200);

  const usdtBalance = balanceRes.body.balances.find((b: any) => b.asset === 'USDT');
  console.log('USDT Balance:', usdtBalance);
  expect(usdtBalance).toBeDefined();
});
