export type BrowserCheck={name:string;url:string;steps:string[];expected:string};
export type BrowserEvidence={name:string;passed:boolean;details:string;screenshot?:string};

/** Contrato do verificador visual. A implementação Electron/Playwright será ligada na próxima etapa. */
export interface BrowserVerifier { run(checks:BrowserCheck[]):Promise<BrowserEvidence[]>; }

export class PreviewVerifier implements BrowserVerifier {
  async run(checks:BrowserCheck[]):Promise<BrowserEvidence[]> {
    return checks.map(check=>({name:check.name,passed:false,details:`Preview ainda não iniciado: ${check.url}`}));
  }
}

