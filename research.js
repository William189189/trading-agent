const { getAccount, getLatestQuote, getBars, getPositions } = require('./alpaca');

const WATCHLIST = ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD'];

function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

function calcSMA(closes, period = 20) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return parseFloat((slice.reduce((a, b) => a + b, 0) / period).toFixed(4));
}

async function buildMarketData() {
  const account = await getAccount();
  const positions = await getPositions();
  const positionMap = {};
  for (const p of positions) {
    positionMap[p.symbol] = {
      qty: parseFloat(p.qty),
      market_value: parseFloat(p.market_value),
      unrealized_pl: parseFloat(p.unrealized_pl),
    };
  }

  const watchlist = [];

  for (const symbol of WATCHLIST) {
    let price = null;
    let change_pct_1d = null;
    let rsi_14 = null;
    let above_20ma = null;

    const bars = await getBars(symbol, 30);
    console.log(`${symbol}: got ${bars.length} bars`);

    if (bars.length >= 2) {
      const closes = bars.map(b => b.c);
      price = closes[closes.length - 1];
      const prev = closes[closes.length - 2];
      change_pct_1d = parseFloat((((price - prev) / prev) * 100).toFixed(4));
      rsi_14 = calcRSI(closes);
      const sma20 = calcSMA(closes, 20);
      above_20ma = sma20 !== null ? price > sma20 : null;
      console.log(`${symbol}: price=${price}, change=${change_pct_1d}%, RSI=${rsi_14}, above20ma=${above_20ma}`);
    } else {
      try {
        const quoteData = await getLatestQuote(symbol);
        price = quoteData.quote?.ap ?? quoteData.quote?.bp ?? null;
        console.log(`${symbol}: no bars, quote price=${price}`);
      } catch (e) {
        console.error(`${symbol} quote fallback failed:`, e.message);
      }
    }

    watchlist.push({
      symbol,
      price,
      change_pct_1d,
      rsi_14,
      above_20ma,
      recent_headlines: [],
      current_position: positionMap[symbol] || null,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    account: {
      buying_power: parseFloat(account.buying_power),
      portfolio_value: parseFloat(account.portfolio_value),
    },
    watchlist,
  };
}

module.exports = { buildMarketData };
