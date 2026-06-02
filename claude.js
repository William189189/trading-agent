const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const SESSION_TOKEN_FILE = '/home/claude/.claude/remote/.session_ingress_token';
const authToken = process.env.ANTHROPIC_AUTH_TOKEN ||
  (fs.existsSync(SESSION_TOKEN_FILE) ? fs.readFileSync(SESSION_TOKEN_FILE, 'utf8').trim() : null);
const client = authToken ? new Anthropic({ authToken, apiKey: null }) : new Anthropic();

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
  const clean = responseText.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

module.exports = { getTradeDecision };