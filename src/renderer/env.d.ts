import type { Workspace } from '../core/workspaces';
import type { RunResult } from '../core/types';
import type { Conversation } from '../core/conversations';
export {};
declare global {
 interface Window {
  forge?: {
   projects: { list(): Promise<Workspace[]>; open(): Promise<Workspace | null>; create(): Promise<Workspace | null>; remove(id: string): Promise<void>; addRemote(input: { name: string; remoteUrl: string; branch?: string; owner?: string; repository?: string }): Promise<Workspace>; syncRemote(id: string): Promise<Workspace | null> };
   conversations: { list(projectId: string): Promise<Conversation[]>; create(projectId: string): Promise<Conversation>; save(conversation: Conversation): Promise<Conversation> };
   run(id: string, input: string): Promise<RunResult>;
   execute(id: string, plan: RunResult['plan']): Promise<RunResult>;
   read(id: string, file: string): Promise<string>;
   checkForUpdates(): Promise<{status: string; message?: string}>;
   oneai: { get(): Promise<{baseUrl:string;model:string;configured:boolean}>; save(config:{baseUrl:string;apiKey:string;model?:string}):Promise<{ok:boolean}>; test():Promise<{ok:boolean;message:string}> };
  };
 }
}

