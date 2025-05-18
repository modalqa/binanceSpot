// placeholder for WebSocket test
import WebSocket from 'ws';
import { test, expect } from '@playwright/test';

test('Connect to BTCUSDT depth WebSocket', async ({}, testInfo) => {
  const symbol = 'btcusdt';
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth`);

  let isMessageReceived = false;
  ws.on('message', (data) => {
    console.log('Received message:', data.toString());
    isMessageReceived = true;
    ws.close();
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));
  expect(isMessageReceived).toBeTruthy();
});
