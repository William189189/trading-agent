require('dotenv').config();
const { buildMarketData } = require('./research');
const { getTradeDecision } = require('./claude');
const { executeDecision } = require('./execution');
const { writeJournalEntry } = require('./journal');

async function runCycle() {
  const timestamp = new Date().toISOString();
  console.log(`Starting cycle: ${timestamp}`);

  const marketData = await buildMarketData();
  const decision = await getTradeDecision(marketData);
  const order = await executeDecision(decision);

  writeJournalEntry({ marketData, decision, order, timestamp });

  console.log(`Cycle complete. Decision: ${decision.decision}`);
}

runCycle().catch(console.error);