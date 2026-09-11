export {}; declare global { interface Window { forge:{run:(input:string)=>Promise<any>; read:(p:string)=>Promise<string>; checkForUpdates:()=>Promise<{status:string;message?:string}>}; } }

