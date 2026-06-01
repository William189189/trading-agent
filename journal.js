const fs = require('fs');
const path = require('path');

function writeJournalEntry({ marketData, decision, order, timestamp }) {
  const entry = {
    timestamp,
    market_snapshot: marketData,
    agent_decision: decision,
    order_result: order || 'NO_ORDER_PLACED',
  };

  const logPath = path.join('./journal', `${timestamp.split('T')[0]}.jsonl`);
  fs.mkdirSync('./journal', { recursive: true });
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
}

module.exports = { writeJournalEntry };