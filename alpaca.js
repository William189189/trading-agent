const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets';
const ALPACA_DATA_URL = 'https://data.alpaca.markets';
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
    `${ALPACA_DATA_URL}/v2/stocks/${symbol}/quotes/latest`,
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

// Fetch daily bars for a symbol. Returns array of bar objects sorted oldest->newest.
async function getBars(symbol, limit = 30) {
  // No feed param — let Alpaca pick best available for the account type
  const url = `${ALPACA_DATA_URL}/v2/stocks/${symbol}/bars?timeframe=1Day&limit=${limit}&adjustment=raw`;
  console.log(`Fetching bars for ${symbol}: ${url}`);
  const res = await fetch(url, {
    headers: {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    },
  });
  const text = await res.text();
  console.log(`getBars response for ${symbol} (status ${res.status}):`, text.substring(0, 300));
  try {
    const data = JSON.parse(text);
    if (data.message || data.error) {
      console.error(`Alpaca getBars API error for ${symbol}:`, data.message || data.error);
      return [];
    }
    return data.bars || [];
  } catch {
    console.error(`Alpaca getBars parse error for ${symbol}:`, text);
    return [];
  }
}

async function getPositions() {
  const res = await fetch(`${ALPACA_BASE_URL}/v2/positions`, {
    headers: {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Alpaca getPositions error:', text);
    return [];
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

module.exports = { getAccount, getLatestQuote, getBars, getPositions, placeOrder };
