import type {Action,Plan} from './types.js';
export type BrainRequest={kind:'plan';goal:string;context:string[];skills:string[];budget:number};
export type BrainResponse={plan:Plan;reasoning?:string;actions?:Action[]};
export function parseBrainResponse(raw:string):BrainResponse{const parsed=JSON.parse(raw) as BrainResponse;if(!parsed.plan||!Array.isArray(parsed.plan.actions))throw Error('Resposta do cérebro fora do formato');return parsed;}

