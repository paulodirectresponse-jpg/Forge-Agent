import path from 'node:path';
const destructive=/\b(rm|del|erase|format|shutdown|reboot|git\s+(reset|clean)|Remove-Item)\b/i;
export function isDestructive(command:string){return destructive.test(command);}
export function validatePath(root:string, candidate:string){const base=path.resolve(root); const resolved=path.resolve(base,candidate); return resolved===base || resolved.startsWith(base+path.sep);}

