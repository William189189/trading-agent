const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const client = new Anthropic();

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
  const start = responseText.indexOf('{');
  if (start === -1) throw new Error(`No JSON object found in response: ${responseText}`);
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < responseText.length; i++) {
    const c = responseText[i];
    if (escape) { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (!inString) {
      if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return JSON.parse(responseText.slice(start, i + 1));
    }
  }
  throw new Error(`No balanced JSON object found in response: ${responseText}`);
}

module.exports = { getTradeDecision };