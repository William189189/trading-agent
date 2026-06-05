const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const client = new Anthropic({ maxRetries: 6 });

async function getTradeDecision(marketData) {
  const systemPrompt = fs.readFileSync('./system_prompt.md', 'utf8');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
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
  const match = responseText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON object found in response: ${responseText}`);
  return JSON.parse(match[0]);
}

module.exports = { getTradeDecision };