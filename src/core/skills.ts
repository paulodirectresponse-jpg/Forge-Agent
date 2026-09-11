export type Skill={name:string;description:string;instructions:string};
export const defaultSkills:Skill[]=[
 {name:'typescript',description:'Tipagem estrita e APIs seguras',instructions:'Evite any; valide entradas.'},
 {name:'react-quality',description:'React previsível e acessível',instructions:'Componentes pequenos; estados explícitos.'},
 {name:'debugging',description:'Diagnóstico orientado a evidências',instructions:'Reproduza antes de corrigir.'},
 {name:'security-review',description:'Comandos e caminhos seguros',instructions:'Bloqueie operações destrutivas sem aprovação.'},
 {name:'playwright',description:'Fluxos de browser verificáveis',instructions:'Use seletores acessíveis e screenshots.'}
];
export function selectSkills(goal:string){const g=goal.toLowerCase(); return defaultSkills.filter(s=>s.name==='typescript'||(g.includes('react')&&s.name==='react-quality')||(g.includes('bug')&&s.name==='debugging')||(g.includes('browser')&&s.name==='playwright')||s.name==='security-review');}

