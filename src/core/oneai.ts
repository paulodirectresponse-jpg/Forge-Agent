import type { BrainResponse } from './protocol.js';

export type OneAIConfig = { baseUrl: string; apiKey: string; model?: string };
export type OneAIPlanInput = { goal: string; context: string[]; skills: string[]; budget: number };

export async function requestOneAI(config: OneAIConfig, input: OneAIPlanInput): Promise<BrainResponse> {
  if (!config.apiKey.trim()) throw Error('Configure a chave da UseOneAI antes de executar um pedido.');
  const base = config.baseUrl.replace(/\/$/, '');
  const model = config.model || 'openai:gpt-5.5';
  const qualifiedModel = model.includes(':') ? model : model.startsWith('claude-') ? `anthropic:${model}` : model.startsWith('gemini-') ? `google:${model}` : `openai:${model}`;
  const response = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({ model: qualifiedModel, messages: [{ role: 'system', content: 'Return only valid JSON with this shape: {"plan":{"goal":string,"actions":[],"model":string,"estimatedTokens":number}}.' }, { role: 'user', content: JSON.stringify(input) }], max_completion_tokens: 2000 }),
  });
  if (!response.ok) throw Error(`UseOneAI respondeu ${response.status}. Verifique o endereço e a chave.`);
  const payload: unknown = await response.json();
  const message = (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
  const parsed = typeof message === 'string' ? JSON.parse(message.replace(/^```json\s*|\s*```$/g, '')) : payload;
  const candidate = (parsed as { plan?: unknown; output?: unknown; data?: unknown }).plan ?? (parsed as { output?: unknown }).output ?? (parsed as { data?: unknown }).data ?? parsed;
  if (!candidate || typeof candidate !== 'object' || !Array.isArray((candidate as { actions?: unknown }).actions)) throw Error('A resposta da UseOneAI não contém um plano JSON válido.');
  return { plan: candidate as BrainResponse['plan'] };
}

