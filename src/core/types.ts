export type Action = {type:'read_file'|'write_file'|'run_command'|'git_status'|'quality_gate'|'browser_check'; path?:string; content?:string; command?:string; url?:string; steps?:string[]};
export type Plan = {goal:string; actions:Action[]; model?:string; estimatedTokens?:number};
export type RunResult = {ok:boolean; message:string; plan?:Plan; outputs?:string[]; needsApproval?:boolean};

