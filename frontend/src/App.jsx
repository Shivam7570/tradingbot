import React, { useEffect, useState } from 'react';
import { getStatus, getTrades, getMarketData, startBot, stopBot, updateConfig } from './api';
import Dashboard from './components/Dashboard.jsx';
import TradeHistory from './components/TradeHistory.jsx';
import BotControls from './components/BotControls.jsx';

export default function App() {
  const [status, setStatus] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const refreshData = async () => {
    try {
      const [s, m, t] = await Promise.all([
        getStatus().catch(() => null),
        getMarketData().catch(() => null),
        getTrades().catch(() => []),
      ]);
      if (s) setStatus(s);
      if (m) setMarketData(m);
      if (t) setTrades(t);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Data refresh error:', err.message);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    await startBot();
    await refreshData();
  };

  const handleStop = async () => {
    await stopBot();
    await refreshData();
  };

  const handleUpdateConfig = async (newConfig) => {
    await updateConfig(newConfig);
    await refreshData();
  };

  const ticker = marketData?.ticker;

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <div className="brand">
          <div className="logo-icon">⚡</div>
          <div>
            <h1 className="title">QUANT BOT TERMINAL</h1>
            <div className="subtitle">Automated Moving Average Crossover Strategy Loop</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            Live Sync: <span style={{ color: '#06B6D4' }}>{lastRefreshed.toLocaleTimeString()}</span>
          </div>
          <button className="btn btn-secondary" onClick={refreshData}>
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* Real-time KPI Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">Market Pair</div>
          <div className="stat-value" style={{ color: '#06B6D4' }}>
            {status?.symbol || 'BTC/USDT'}
          </div>
          <div className="stat-sub">Binance Spot Market</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Current Price</div>
          <div className="stat-value">
            ${ticker?.last ? Number(ticker.last).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
          </div>
          <div className={`stat-sub ${ticker?.change >= 0 ? 'positive' : 'negative'}`}>
            {ticker?.change >= 0 ? '▲' : '▼'} {ticker?.change || 0}% 24h
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Current Signal</div>
          <div
            className="stat-value"
            style={{
              color:
                status?.lastSignal === 'buy'
                  ? '#10B981'
                  : status?.lastSignal === 'sell'
                  ? '#EF4444'
                  : '#9CA3AF',
              textTransform: 'uppercase',
            }}
          >
            {status?.lastSignal || 'NONE'}
          </div>
          <div className="stat-sub">Fast/Slow Crossover</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Trades Logged</div>
          <div className="stat-value" style={{ color: '#F59E0B' }}>
            {trades.length}
          </div>
          <div className="stat-sub">{status?.liveTrading ? 'Live Mode' : 'Paper Trading'}</div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        <Dashboard marketData={marketData} config={status} />
        <BotControls
          status={status}
          onStart={handleStart}
          onStop={handleStop}
          onUpdateConfig={handleUpdateConfig}
        />
      </div>

      {/* Trade History */}
      <TradeHistory trades={trades} />
    </div>
  );
}
