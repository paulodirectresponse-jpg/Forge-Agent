import type { Workspace } from '../core/workspaces';
import type { RunResult } from '../core/types';
export {};
declare global {
 interface Window {
  forge?: {
   projects: { list(): Promise<Workspace[]>; open(): Promise<Workspace | null>; create(): Promise<Workspace | null>; remove(id: string): Promise<void> };
   run(id: string, input: string): Promise<RunResult>;
   read(id: string, file: string): Promise<string>;
   checkForUpdates(): Promise<{status: string; message?: string}>;
   oneai: { get(): Promise<{baseUrl:string;model:string;configured:boolean}>; save(config:{baseUrl:string;apiKey:string;model?:string}):Promise<{ok:boolean}>; test():Promise<{ok:boolean;message:string}> };
  };
 }
}

