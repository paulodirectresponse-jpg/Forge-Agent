import type { BrainResponse } from './protocol.js';

export type OneAIConfig = { baseUrl: string; apiKey: string; model?: string };
export type OneAIPlanInput = { goal: string; context: string[]; skills: string[]; budget: number };

export async function requestOneAI(config: OneAIConfig, input: OneAIPlanInput): Promise<BrainResponse> {
  if (!config.apiKey.trim()) throw Error('Configure a chave da UseOneAI antes de executar um pedido.');
  const base = config.baseUrl.replace(/\/$/, '');
  const response = await fetch(`${base}/v1/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': config.apiKey },
    body: JSON.stringify({ type: 'agent_plan', input, options: { llm: config.model ? { model: config.model } : undefined } }),
  });
  if (!response.ok) throw Error(`UseOneAI respondeu ${response.status}. Verifique o endereço e a chave.`);
  const payload: unknown = await response.json();
  const candidate = (payload as { plan?: unknown; output?: unknown; data?: unknown }).plan ?? (payload as { output?: unknown }).output ?? (payload as { data?: unknown }).data ?? payload;
  if (!candidate || typeof candidate !== 'object' || !Array.isArray((candidate as { actions?: unknown }).actions)) throw Error('A resposta da UseOneAI não contém um plano JSON válido.');
  return { plan: candidate as BrainResponse['plan'] };
}

