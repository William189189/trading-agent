const { getAccount, getLatestQuote } = require('./alpaca');

const WATCHLIST = ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD'];

async function buildMarketData() {
  const account = await getAccount();
  const watchlist = [];

  for (const symbol of WATCHLIST) {
    const quote = await getLatestQuote(symbol);
    watchlist.push({
      symbol,
      price: quote.quote?.ap ?? null,
      change_pct_1d: null,
      rsi_14: null,
      above_20ma: null,
      recent_headlines: [],
      current_position: null
    });
  }

  return {
    timestamp: new Date().toISOString(),
    account: {
      buying_power: parseFloat(account.buying_power),
      portfolio_value: parseFloat(account.portfolio_value)
    },
    watchlist
  };
}

module.exports = { buildMarketData };