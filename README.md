# Binance Spot Trading - SDET Automation

## Setup
```bash
npm install
cp .env.example .env
```

## Run tests
```bash
npx playwright test
```

## Notes
- Uses Playwright Test for framework
- REST API tested via Supertest
- WebSocket tested via `ws` package

## Test Case Details

Below are the automated test cases in the `tests` folder, described in a way that anyone (including non-technical users) can understand what is being tested and why.

---

### 1. WebSocket: depth stream

- **I as a user**,  
  **connect to the Binance WebSocket depth stream**  
  **to verify that I can receive real-time order book updates for BTC/USDT.**

---

### 2. WebSocket: trade stream

- **I as a user**,  
  **connect to the Binance WebSocket trade stream**  
  **to verify that I can receive real-time trade updates for BTC/USDT.**

---

### 3. WebSocket: user stream via listenKey

- **I as a user**,  
  **create a user data stream and place an order**  
  **to verify that my account activity (like order events) is pushed to me in real-time via WebSocket.**

---

### 4. Place LIMIT order and check balance

- **I as a user**,  
  **place a LIMIT BUY order and check my balance**  
  **to ensure that placing an order works and that I can retrieve my updated account balance.**

---

### 5. E2E: Place Order -> Check Open Orders -> Cancel -> Check Balance

- **I as a user**,  
  **place a LIMIT BUY order, check if it appears in my open orders, cancel it, and check my balance again**  
  **to confirm that the full order lifecycle (place, verify, cancel, and balance check) works as expected.**

---

> These tests help ensure that both the trading API and real-time WebSocket features are working correctly for Binance Spot Trading
