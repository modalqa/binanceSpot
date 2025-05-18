import dotenv from 'dotenv';
dotenv.config();

export const config = {
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  baseUrl: process.env.BINANCE_BASE_URL || 'https://testnet.binance.vision',
};
