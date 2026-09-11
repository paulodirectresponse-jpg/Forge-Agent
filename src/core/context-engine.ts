import fs from 'node:fs/promises'; import path from 'node:path';
export async function collectContext(root:string, query:string){const files=await fs.readdir(root,{recursive:true}); const relevant=files.filter(f=>/\.(ts|tsx|js|jsx|json|md)$/.test(f)&&!String(f).includes('node_modules')).slice(0,30); return {query,files:relevant.map(String),root:path.resolve(root)};}

