const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  symbol: String,
  side: { type: String, enum: ['buy', 'sell'] },
  amount: Number,
  price: Number,
  cost: Number,
  mode: { type: String, enum: ['paper', 'live'], default: 'paper' },
  strategy: String,
  reason: String,
  timestamp: { type: Date, default: Date.now }
});

const MongoTrade = mongoose.model('Trade', tradeSchema);

const memoryTrades = [];

class TradeWrapper {
  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      try { return await MongoTrade.create(data); } catch (e) {}
    }
    const trade = {
      _id: String(Date.now()),
      timestamp: new Date(),
      ...data
    };
    memoryTrades.unshift(trade);
    return trade;
  }

  static find() {
    if (mongoose.connection.readyState === 1) {
      try { return MongoTrade.find(); } catch (e) {}
    }
    return {
      sort: () => ({
        limit: (n) => Promise.resolve(memoryTrades.slice(0, n))
      })
    };
  }
}

module.exports = TradeWrapper;

