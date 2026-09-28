const { createExchange, fetchOHLCV, fetchTicker, createOrder } = require('./exchangeService');
const { smaCrossoverSignal } = require('./strategyEngine');
const Trade = require('../models/Trade');
const BotConfig = require('../models/BotConfig');

let exchange = null;
let position = null; // 'long' or null - naive single-position tracking

function getExchange() {
  if (!exchange) exchange = createExchange();
  return exchange;
}

async function runStrategyOnce() {
  const config = await BotConfig.findOne();
  if (!config || !config.isRunning) return;

  const symbol = config.symbol;
  const ex = getExchange();

  const candles = await fetchOHLCV(ex, symbol, process.env.TIMEFRAME || '5m', 100);
  const closes = candles.map((c) => c[4]);

  const signal = smaCrossoverSignal(closes, config.fastSMA, config.slowSMA);
  config.lastSignal = signal;
  config.updatedAt = new Date();

  if (signal === 'buy' && position !== 'long') {
    const ticker = await fetchTicker(ex, symbol);
    const price = ticker.last;
    const amount = config.tradeAmountUSDT / price;

    if (config.liveTrading) {
      await createOrder(ex, symbol, 'buy', amount);
    }

    await Trade.create({
      symbol,
      side: 'buy',
      amount,
      price,
      cost: config.tradeAmountUSDT,
      mode: config.liveTrading ? 'live' : 'paper',
      strategy: 'sma_crossover',
      reason: 'fast SMA crossed above slow SMA',
    });

    position = 'long';
    console.log(`BUY signal executed for ${symbol} at ${price}`);
  } else if (signal === 'sell' && position === 'long') {
    const ticker = await fetchTicker(ex, symbol);
    const price = ticker.last;
    const amount = config.tradeAmountUSDT / price;

    if (config.liveTrading) {
      await createOrder(ex, symbol, 'sell', amount);
    }

    await Trade.create({
      symbol,
      side: 'sell',
      amount,
      price,
      cost: config.tradeAmountUSDT,
      mode: config.liveTrading ? 'live' : 'paper',
      strategy: 'sma_crossover',
      reason: 'fast SMA crossed below slow SMA',
    });

    position = null;
    console.log(`SELL signal executed for ${symbol} at ${price}`);
  }

  await config.save();
}

module.exports = { runStrategyOnce };
