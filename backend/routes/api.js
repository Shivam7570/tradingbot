const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const BotConfig = require('../models/BotConfig');
const { createExchange, fetchOHLCV, fetchTicker } = require('../services/exchangeService');
const { SMA } = require('technicalindicators');

let exchange = null;
function getExchange() {
  if (!exchange) exchange = createExchange();
  return exchange;
}

router.get('/status', async (req, res) => {
  const config = await BotConfig.findOne();
  res.json(config);
});

router.post('/start', async (req, res) => {
  let config = await BotConfig.findOne();
  if (!config) config = new BotConfig({});
  config.isRunning = true;
  await config.save();
  res.json({ message: 'Bot started', config });
});

router.post('/stop', async (req, res) => {
  const config = await BotConfig.findOne();
  if (config) {
    config.isRunning = false;
    await config.save();
  }
  res.json({ message: 'Bot stopped', config });
});

router.put('/config', async (req, res) => {
  let config = await BotConfig.findOne();
  if (!config) config = new BotConfig({});
  Object.assign(config, req.body);
  await config.save();
  res.json(config);
});

router.get('/trades', async (req, res) => {
  const trades = await Trade.find().sort({ timestamp: -1 }).limit(100);
  res.json(trades);
});

router.get('/market', async (req, res) => {
  try {
    const config = await BotConfig.findOne();
    const symbol = config?.symbol || 'BTC/USDT';
    const fastPeriod = Number(config?.fastSMA || 9);
    const slowPeriod = Number(config?.slowSMA || 21);

    const ex = getExchange();
    const timeframe = process.env.TIMEFRAME || '5m';
    const candles = await fetchOHLCV(ex, symbol, timeframe, 60);
    const ticker = await fetchTicker(ex, symbol).catch(() => null);

    const closes = candles.map((c) => c[4]);
    const fastSMA = SMA.calculate({ period: fastPeriod, values: closes });
    const slowSMA = SMA.calculate({ period: slowPeriod, values: closes });

    const fastOffset = closes.length - fastSMA.length;
    const slowOffset = closes.length - slowSMA.length;

    const chartData = candles.map((c, i) => {
      const date = new Date(c[0]);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        timestamp: c[0],
        time: timeStr,
        open: c[1],
        high: c[2],
        low: c[3],
        price: c[4],
        volume: c[5],
        fastSMA: i >= fastOffset ? Number(fastSMA[i - fastOffset].toFixed(2)) : null,
        slowSMA: i >= slowOffset ? Number(slowSMA[i - slowOffset].toFixed(2)) : null,
      };
    });

    res.json({
      symbol,
      ticker: ticker ? {
        last: ticker.last,
        high: ticker.high,
        low: ticker.low,
        change: ticker.percentage ? Number(ticker.percentage.toFixed(2)) : 0,
        volume: ticker.baseVolume
      } : { last: closes[closes.length - 1] },
      chartData,
    });
  } catch (err) {
    console.error('Market endpoint error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/ticker', async (req, res) => {
  try {
    const config = await BotConfig.findOne();
    const symbol = req.query.symbol || config?.symbol || 'BTC/USDT';
    const ex = getExchange();
    const ticker = await fetchTicker(ex, symbol);
    res.json(ticker);
  } catch (err) {
    console.error('Ticker endpoint error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


