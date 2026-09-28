const mongoose = require('mongoose');

const botConfigSchema = new mongoose.Schema({
  isRunning: { type: Boolean, default: false },
  symbol: String,
  fastSMA: Number,
  slowSMA: Number,
  tradeAmountUSDT: Number,
  liveTrading: { type: Boolean, default: false },
  lastSignal: { type: String, default: 'none' },
  updatedAt: { type: Date, default: Date.now }
});

const MongoBotConfig = mongoose.model('BotConfig', botConfigSchema);

let memoryConfig = null;

class BotConfigWrapper {
  static async findOne() {
    if (mongoose.connection.readyState === 1) {
      try { return await MongoBotConfig.findOne(); } catch (e) {}
    }
    if (!memoryConfig) {
      memoryConfig = {
        _id: 'default',
        isRunning: true,
        symbol: process.env.SYMBOL || 'BTC/USDT',
        fastSMA: Number(process.env.FAST_SMA || 9),
        slowSMA: Number(process.env.SLOW_SMA || 21),
        tradeAmountUSDT: Number(process.env.TRADE_AMOUNT_USDT || 50),
        liveTrading: process.env.LIVE_TRADING === 'true',
        lastSignal: 'none',
        updatedAt: new Date(),
        save: async function() {
          memoryConfig.updatedAt = new Date();
          return memoryConfig;
        }
      };
    }
    return memoryConfig;
  }

  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      try { return await MongoBotConfig.create(data); } catch (e) {}
    }
    memoryConfig = {
      _id: 'default',
      ...data,
      save: async function() {
        memoryConfig.updatedAt = new Date();
        return memoryConfig;
      }
    };
    return memoryConfig;
  }
}

module.exports = BotConfigWrapper;

