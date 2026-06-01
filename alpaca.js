const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets';
const ALPACA_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET = process.env.ALPACA_API_SECRET;

console.log('Alpaca key loaded:', !!ALPACA_KEY, '| Secret loaded:', !!ALPACA_SECRET);

async function getAccount() {
  const res = await fetch(`${ALPACA_BASE_URL}/v2/account`, {
    headers: {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Alpaca getAccount error response:', text);
    throw new Error('Alpaca API returned non-JSON response');
  }
}

async function getLatestQuote(symbol) {
  const res = await fetch(
    `https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`,
    {
      headers: {
        'APCA-API-KEY-ID': ALPACA_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET,
      },
    }
  );
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(`Alpaca getLatestQuote error for ${symbol}:`, text);
    throw new Error('Alpaca API returned non-JSON response');
  }
}

async function placeOrder({ symbol, qty, side, type = 'market', timeInForce = 'day' }) {
  const res = await fetch(`${ALPACA_BASE_URL}/v2/orders`, {
    method: 'POST',
    headers: {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symbol, qty, side, type, time_in_force: timeInForce }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Alpaca placeOrder error response:', text);
    throw new Error('Alpaca API returned non-JSON response');
  }
}

module.exports = { getAccount, getLatestQuote, placeOrder };