require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const BotConfig = require('./models/BotConfig');
const { runStrategyOnce } = require('./services/botEngine');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  let config = await BotConfig.findOne();
  if (!config) {
    config = await BotConfig.create({
      symbol: process.env.SYMBOL || 'BTC/USDT',
      fastSMA: Number(process.env.FAST_SMA || 9),
      slowSMA: Number(process.env.SLOW_SMA || 21),
      tradeAmountUSDT: Number(process.env.TRADE_AMOUNT_USDT || 50),
      liveTrading: process.env.LIVE_TRADING === 'true',
      isRunning: true,
    });
    console.log('Created default bot config (Auto-run enabled)');
  } else {
    config.isRunning = true;
    await config.save();
  }

  // Run strategy immediately on startup
  try {
    console.log('🤖 Running strategy automatically on startup...');
    await runStrategyOnce();
  } catch (err) {
    console.error('Initial strategy run error:', err.message);
  }

  const cronExpr = process.env.POLL_INTERVAL_CRON || '*/1 * * * *';
  cron.schedule(cronExpr, async () => {
    try {
      await runStrategyOnce();
    } catch (err) {
      console.error('Strategy run error:', err.message);
    }
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
