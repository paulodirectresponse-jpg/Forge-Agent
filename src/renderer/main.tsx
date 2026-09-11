import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Workspace } from '../core/workspaces';
import './styles.css';
import './settings.css';
import './overrides.css';

type Message = { role: 'user' | 'agent'; text: string };
function App() {
 const [projects,setProjects]=useState<Workspace[]>([]);
 const [active,setActive]=useState('');
 const [histories,setHistories]=useState<Record<string,Message[]>>({});
 const [input,setInput]=useState('');
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const [settings,setSettings]=useState(false);
 const [oneai,setOneai]=useState({baseUrl:'https://api.useoneai.app/v1',apiKey:'',model:'chatgpt-5.5'});
 const [oneaiStatus,setOneaiStatus]=useState('');
 const [tab,setTab]=useState('preview');
 const project=projects.find(item=>item.id===active);
 useEffect(()=>{window.forge?.projects.list().then(items=>{setProjects(items);setActive(items[0]?.id??'');}).catch(error=>setNotice(String(error)));},[]);
 async function select(kind:'open'|'create') {
  if(!window.forge){setNotice('A seleção de pastas está disponível no aplicativo desktop.');return;}
  try {const item=await window.forge.projects[kind]();if(item){setProjects(await window.forge.projects.list());setActive(item.id);setNotice('');}}catch(error){setNotice(String(error));}
 }
 async function remove(id:string){if(!window.forge)return;try{await window.forge.projects.remove(id);const next=await window.forge.projects.list();setProjects(next);if(active===id)setActive(next[0]?.id??'');setNotice('Projeto removido da lista. Os arquivos foram preservados.');}catch(error){setNotice(String(error));}}
 async function send(){if(!project||!input.trim()||busy||!window.forge)return;const id=project.id;const text=input.trim();setInput('');setBusy(true);setHistories(items=>({...items,[id]:[...(items[id]??[]),{role:'user',text}]}));try{const result=await window.forge.run(id,text);setHistories(items=>({...items,[id]:[...(items[id]??[]),{role:'agent',text:[result.message,...(result.outputs??[]),'Este plano ainda não executou mudanças nem testes.'].join('\n')}]}));}catch(error){setNotice(String(error));}finally{setBusy(false);}}
 async function updates(){try{const result=await window.forge?.checkForUpdates();setNotice(result?.message??(result?.status==='dev'?'Atualizações disponíveis apenas na versão instalada.':'Verificação de atualização solicitada.'));}catch(error){setNotice(String(error));}}
 async function openSettings(){setSettings(true);if(window.forge){const saved=await window.forge.oneai.get();setOneai(items=>({...items,baseUrl:saved.baseUrl,model:saved.model}));setOneaiStatus(saved.configured?'Chave salva com segurança.':'Nenhuma chave configurada.');}}
 async function saveOneAI(){try{await window.forge?.oneai.save(oneai);setOneaiStatus('Chave salva com segurança.');}catch(error){setOneaiStatus(String(error));}}
 async function testOneAI(){try{const result=await window.forge?.oneai.test();setOneaiStatus(result?.message??'Não foi possível testar.');}catch(error){setOneaiStatus(String(error));}}
 return <main className="app-shell">
  <aside className="sidebar"><div className="brand-row"><div className="brand-mark">F</div><div className="brand">Forge Agent</div></div>
   <button className="new-chat" disabled={busy} onClick={()=>select('create')}>＋ Novo projeto</button>
   <button className="side-link" disabled={busy} onClick={()=>select('open')}>Abrir pasta existente</button>
   <div className="side-label">PROJETOS</div><div className="project-list">{projects.map(item=><div className={'project-row '+(item.id===active?'chosen':'')} key={item.id}><button className="project-name project-select" onClick={()=>setActive(item.id)} title={item.path}><b>{item.name}</b></button><button className="delete" disabled={busy} onClick={()=>remove(item.id)} aria-label={'Remover '+item.name+' da lista'}>×</button></div>)}</div>
   <div className="credits-card"><small>Integração de IA</small><span>UseOneAI: {oneaiStatus.includes('conectada')?'conectada':'configuração pendente'}</span><button onClick={openSettings}>Configurar UseOneAI</button><button onClick={updates} disabled={!window.forge}>Verificar atualização</button></div>
  </aside>
  <section className="workspace"><header className="topbar"><div className="project-crumb"><b>{project?.name??'Escolha um projeto'}</b></div><div className="model-status">Modo de planejamento local</div><div className="top-actions"><button className="run" onClick={send} disabled={!project||busy||!input.trim()}>{busy?'Analisando…':'Preparar plano'}</button></div></header>
   {notice&&<div className="notice" role="status">{notice}<button aria-label="Fechar aviso" onClick={()=>setNotice('')}>×</button></div>}
   <div className="workspace-grid"><section className="conversation-pane"><div className="conversation-title"><h1>Conversa</h1></div><div className="messages">{!(histories[active]?.length)&&<p className="welcome">{project?'Descreva a alteração desejada para preparar um plano.':'Crie um projeto ou abra uma pasta existente para começar.'}</p>}{(histories[active]??[]).map((message,index)=><div className={'message '+message.role} key={index}><div className="avatar">{message.role==='agent'?'F':'P'}</div><div className="message-body"><div className="message-meta"><b>{message.role==='agent'?'Forge Agent':'Você'}</b></div><div className="bubble">{message.text}</div></div></div>)}</div><div className="composer"><textarea aria-label="Mensagem" value={input} onChange={event=>setInput(event.target.value)} disabled={!project||busy} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();void send();}}} placeholder="Descreva o que deseja construir…"/><div className="composer-tools"><span>Enter para enviar · Shift+Enter para nova linha</span><button className="send" aria-label="Enviar" disabled={!project||busy||!input.trim()} onClick={send}>↑</button></div></div></section>
   <section className="build-pane"><div className="build-toolbar"><div className="view-tabs"><button className={tab==='preview'?'selected':''} onClick={()=>setTab('preview')}>Preview</button><button className={tab==='checks'?'selected':''} onClick={()=>setTab('checks')}>Verificações</button><button className={tab==='project'?'selected':''} onClick={()=>setTab('project')}>Projeto</button></div></div><div className="build-surface"><div className="deploy-empty">{tab==='preview'?<><b>Seu projeto, em funcionamento</b><span>O preview aparecerá após a integração do executor. Nenhum site foi gerado ainda.</span></>:tab==='checks'?<><b>Nenhuma verificação executada</b><span>Testes de código, testes visuais e revisão ainda não foram executados neste projeto.</span></>:<><b>{project?.name??'Nenhum projeto selecionado'}</b><span>{project?.path??'Abra ou crie uma pasta na lateral.'}</span></>}</div></div></section></div>
  </section>{settings&&<div className="settings-backdrop"><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button className="settings-close" onClick={()=>setSettings(false)} aria-label="Fechar">×</button><h2 id="settings-title">Conectar UseOneAI</h2><p>A chave fica criptografada no computador e não aparece na conversa.</p><label>Endereço da API<input value={oneai.baseUrl} onChange={event=>setOneai(items=>({...items,baseUrl:event.target.value}))}/></label><label>Chave da API<input type="password" value={oneai.apiKey} onChange={event=>setOneai(items=>({...items,apiKey:event.target.value}))} placeholder="Cole sua chave aqui"/></label><label>Modelo<input value={oneai.model} onChange={event=>setOneai(items=>({...items,model:event.target.value}))}/></label><div className="settings-actions"><button onClick={saveOneAI}>Salvar chave</button><button className="secondary" onClick={testOneAI}>Testar conexão</button></div>{oneaiStatus&&<small className="settings-status">{oneaiStatus}</small>}</section></div>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);

