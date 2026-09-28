import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-time">Time: {label}</div>
        {payload.map((item, index) => (
          <div key={index} className="tooltip-val" style={{ color: item.color }}>
            {item.name}: ${item.value ? Number(item.value).toLocaleString() : 'N/A'}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard({ marketData, config }) {
  if (!marketData || !marketData.chartData || marketData.chartData.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">📈 Market Price & SMA Chart</h2>
        </div>
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>
          Loading real-time market data...
        </div>
      </div>
    );
  }

  const { chartData, ticker, symbol } = marketData;
  const currentPrice = ticker?.last || chartData[chartData.length - 1]?.price || 0;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">
            <span>📈</span> {symbol || 'BTC/USDT'} Live Technical Analysis
          </h2>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            Fast SMA ({config?.fastSMA || 9}) vs Slow SMA ({config?.slowSMA || 21}) Crossover Strategy
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#06B6D4' }}>
            ${Number(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: ticker?.change >= 0 ? '#10B981' : '#EF4444' }}>
            24h: {ticker?.change >= 0 ? '+' : ''}{ticker?.change || 0}%
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 380, marginTop: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 11 }} />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#6B7280"
              tick={{ fontSize: 11 }}
              tickFormatter={(val) => `$${val.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />

            <Area
              type="monotone"
              dataKey="price"
              name="Close Price"
              stroke="#06B6D4"
              strokeWidth={2.5}
              fill="url(#priceGradient)"
            />
            <Line
              type="monotone"
              dataKey="fastSMA"
              name={`Fast SMA (${config?.fastSMA || 9})`}
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="slowSMA"
              name={`Slow SMA (${config?.slowSMA || 21})`}
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
