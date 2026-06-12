const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const client = new Anthropic();

function extractFirstJSON(text) {
  const start = text.indexOf('{');
  if (start === -1) throw new Error(`No JSON object found in response: ${text}`);
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  throw new Error(`Incomplete JSON in response: ${text}`);
}

async function getTradeDecision(marketData) {
  const systemPrompt = fs.readFileSync('./system_prompt.md', 'utf8');

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Here is the current market data. Analyze it and output your trade decision as JSON:\n\n${JSON.stringify(marketData, null, 2)}`
      }
    ]
  });

  const responseText = message.content[0].text;
  return extractFirstJSON(responseText);
}

module.exports = { getTradeDecision };