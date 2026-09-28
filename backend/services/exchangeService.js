const ccxt = require('ccxt');

let publicExchange = null;

function getPublicExchange() {
  if (!publicExchange) {
    publicExchange = new ccxt.binance({ enableRateLimit: true });
  }
  return publicExchange;
}

function createExchange() {
  const exchangeId = process.env.EXCHANGE || 'binance';
  const ExchangeClass = ccxt[exchangeId];

  if (!ExchangeClass) {
    throw new Error(`Exchange "${exchangeId}" not supported by ccxt`);
  }

  const exchange = new ExchangeClass({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET,
    enableRateLimit: true,
    timeout: 8000,
  });

  if (process.env.USE_SANDBOX === 'true' && typeof exchange.setSandboxMode === 'function') {
    try {
      exchange.setSandboxMode(true);
    } catch (e) {
      console.warn('Sandbox mode setting warning:', e.message);
    }
  }

  return exchange;
}

async function fetchOHLCV(exchange, symbol, timeframe, limit = 100) {
  try {
    return await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
  } catch (err) {
    console.warn(`[OHLCV] Exchange fetch failed (${err.message}). Falling back to public exchange API...`);
    const pub = getPublicExchange();
    return await pub.fetchOHLCV(symbol, timeframe, undefined, limit);
  }
}

async function fetchTicker(exchange, symbol) {
  try {
    return await exchange.fetchTicker(symbol);
  } catch (err) {
    console.warn(`[Ticker] Exchange fetch failed (${err.message}). Falling back to public exchange API...`);
    const pub = getPublicExchange();
    return await pub.fetchTicker(symbol);
  }
}

async function createOrder(exchange, symbol, side, amount) {
  try {
    return await exchange.createMarketOrder(symbol, side, amount);
  } catch (err) {
    console.error('Order creation error:', err.message);
    throw err;
  }
}

module.exports = { createExchange, fetchOHLCV, fetchTicker, createOrder };

