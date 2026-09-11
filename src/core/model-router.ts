export type Model='useoneai'|'gpt-5.6-luna';
export class ModelRouter { choose(preferred:Model='useoneai', remainingTokens=10000):Model{return remainingTokens<1000?'gpt-5.6-luna':preferred;} }

