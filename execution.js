const { placeOrder } = require('./alpaca');

async function executeDecision(decision) {
  if (decision.decision === 'NO_TRADE') {
    console.log('No trade placed:', decision.reasoning);
    return null;
  }

  if (decision.confidence === 'LOW') {
    console.log('Skipping low-confidence signal:', decision.reasoning);
    return null;
  }

  const order = await placeOrder({
    symbol: decision.symbol,
    qty: decision.qty,
    side: decision.decision.toLowerCase(),
    type: 'market',
    timeInForce: 'day',
  });

  console.log('Order placed:', order);
  return order;
}

module.exports = { executeDecision };