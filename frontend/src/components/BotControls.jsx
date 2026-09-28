import React, { useState, useEffect } from 'react';

export default function BotControls({ status, onStart, onStop, onUpdateConfig }) {
  const isRunning = status?.isRunning || false;
  
  const [symbol, setSymbol] = useState(status?.symbol || 'BTC/USDT');
  const [fastSMA, setFastSMA] = useState(status?.fastSMA || 9);
  const [slowSMA, setSlowSMA] = useState(status?.slowSMA || 21);
  const [tradeAmount, setTradeAmount] = useState(status?.tradeAmountUSDT || 50);
  const [liveTrading, setLiveTrading] = useState(status?.liveTrading || false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status) {
      setSymbol(status.symbol || 'BTC/USDT');
      setFastSMA(status.fastSMA || 9);
      setSlowSMA(status.slowSMA || 21);
      setTradeAmount(status.tradeAmountUSDT || 50);
      setLiveTrading(status.liveTrading || false);
    }
  }, [status]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateConfig({
        symbol,
        fastSMA: Number(fastSMA),
        slowSMA: Number(slowSMA),
        tradeAmountUSDT: Number(tradeAmount),
        liveTrading,
      });
    } catch (err) {
      console.error('Failed to update config:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">⚙️ Strategy Settings</h2>
        <span className={`status-pill ${isRunning ? 'active' : 'inactive'}`}>
          <span className="pulse-dot"></span>
          {isRunning ? 'BOT ACTIVE' : 'BOT STOPPED'}
        </span>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="form-label">Trading Pair</label>
          <select className="form-select" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
            <option value="BNB/USDT">BNB/USDT</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Fast SMA</label>
            <input
              type="number"
              className="form-input"
              value={fastSMA}
              onChange={(e) => setFastSMA(e.target.value)}
              min="2"
              max="50"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Slow SMA</label>
            <input
              type="number"
              className="form-input"
              value={slowSMA}
              onChange={(e) => setSlowSMA(e.target.value)}
              min="5"
              max="200"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Trade Order Size (USDT)</label>
          <input
            type="number"
            className="form-input"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            min="10"
          />
        </div>

        <div className="form-group" style={{ margin: '16px 0 20px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#F3F4F6' }}>
            <input
              type="checkbox"
              checked={liveTrading}
              onChange={(e) => setLiveTrading(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#06B6D4' }}
            />
            <span>Enable Real Exchange Orders (Default: Paper Trading)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-secondary" style={{ flex: 1 }} disabled={saving}>
            {saving ? 'Saving...' : 'Update Settings'}
          </button>
          
          {isRunning ? (
            <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={onStop}>
              ⏸️ Pause Bot
            </button>
          ) : (
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onStart}>
              ▶️ Start Bot
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
