const { getAccount, getLatestQuote, getPositions } = require('./alpaca');

const WATCHLIST = ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD'];

async function getSnapshot(symbol) {
  const ALPACA_DATA_URL = 'https://data.alpaca.markets';
  const ALPACA_KEY = process.env.ALPACA_API_KEY;
  const ALPACA_SECRET = process.env.ALPACA_API_SECRET;

  const url = `${ALPACA_DATA_URL}/v2/stocks/${symbol}/snapshot`;
  console.log(`Fetching snapshot for ${symbol}`);
  const res = await fetch(url, {
    headers: {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    },
  });
  const text = await res.text();
  console.log(`Snapshot for ${symbol} (${res.status}):`, text.substring(0, 400));
  try {
    return JSON.parse(text);
  } catch {
    console.error(`Snapshot parse error for ${symbol}:`, text);
    return null;
  }
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
    let prev_close = null;

    const snap = await getSnapshot(symbol);

    if (snap && snap.dailyBar && snap.prevDailyBar) {
      const today = snap.dailyBar;
      const prev = snap.prevDailyBar;
      price = today.c || today.h || null;
      prev_close = prev.c || null;
      if (price && prev_close) {
        change_pct_1d = parseFloat((((price - prev_close) / prev_close) * 100).toFixed(4));
      }
      console.log(`${symbol}: price=${price}, prev_close=${prev_close}, change=${change_pct_1d}%`);
    } else if (snap && snap.latestTrade) {
      price = snap.latestTrade.p || null;
      console.log(`${symbol}: fallback to latestTrade price=${price}`);
    } else {
      // Last resort: quote
      try {
        const q = await getLatestQuote(symbol);
        price = q.quote?.ap || q.quote?.bp || null;
        console.log(`${symbol}: fallback to quote price=${price}`);
      } catch (e) {
        console.error(`${symbol} all fallbacks failed:`, e.message);
      }
    }

    watchlist.push({
      symbol,
      price,
      change_pct_1d,
      prev_close,
      rsi_14: null,
      above_20ma: null,
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
