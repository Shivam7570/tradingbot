import React from 'react';

export default function TradeHistory({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-header">
          <h2 className="panel-title">📜 Executed Trade History</h2>
        </div>
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>
          No automated trades executed yet. Watching market signals for SMA crossover...
        </div>
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <div className="panel-header">
        <h2 className="panel-title">📜 Executed Trade History</h2>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>{trades.length} Recent Orders</span>
      </div>

      <div className="table-container">
        <table className="trade-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Cost (USDT)</th>
              <th>Execution Mode</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t._id}>
                <td style={{ color: '#9CA3AF' }}>
                  {new Date(t.timestamp).toLocaleString()}
                </td>
                <td style={{ fontWeight: 600 }}>{t.symbol}</td>
                <td>
                  <span className={`badge ${t.side === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
                    {t.side}
                  </span>
                </td>
                <td className="mono" style={{ color: '#F3F4F6' }}>
                  ${Number(t.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="mono">{Number(t.amount).toFixed(6)}</td>
                <td className="mono">${Number(t.cost).toFixed(2)}</td>
                <td>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: t.mode === 'live' ? '#10B981' : '#F59E0B'
                  }}>
                    {t.mode === 'live' ? '⚡ LIVE' : '📝 PAPER'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
