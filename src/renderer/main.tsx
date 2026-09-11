import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Workspace } from '../core/workspaces';
import type { Conversation } from '../core/conversations';
import type { Plan } from '../core/types';
import './styles.css';
import './settings.css';
import './overrides.css';

type Message = { role: 'user' | 'agent'; text: string };
type RemoteForm = { name: string; remoteUrl: string; branch: string };

function App() {
 const [projects, setProjects] = useState<Workspace[]>([]);
 const [active, setActive] = useState('');
 const [histories, setHistories] = useState<Record<string, Message[]>>({});
 const [input, setInput] = useState('');
 const [busy, setBusy] = useState(false);
 const [notice, setNotice] = useState('');
 const [settings, setSettings] = useState(false);
 const [remoteModal, setRemoteModal] = useState(false);
 const [remote, setRemote] = useState<RemoteForm>({ name: '', remoteUrl: '', branch: 'main' });
 const [oneai, setOneai] = useState({ baseUrl: 'https://api.useoneai.app/v1', apiKey: '', model: 'chatgpt-5.5' });
 const [oneaiStatus, setOneaiStatus] = useState('');
 const [tab, setTab] = useState('preview');
 const [pendingPlan, setPendingPlan] = useState<Plan>();
 const project = projects.find(item => item.id === active);
 const sourceLabel = useMemo(() => project?.source === 'github' ? 'GitHub' : project?.source === 'hybrid' ? 'Híbrido' : 'Local', [project?.source]);

 async function refreshProjects() {
  if (!window.forge) return;
  const items = await window.forge.projects.list();
  setProjects(items);
  setActive(current => current && items.some(item => item.id === current) ? current : (items[0]?.id ?? ''));
 }
 async function loadConversation(projectId: string) {
  if (!window.forge) return;
  const existing = await window.forge.conversations.list(projectId);
  const conversation = existing[0] ?? await window.forge.conversations.create(projectId);
  setHistories(items => ({ ...items, [projectId]: conversation.messages.map(message => ({ role: message.role, text: message.text })) }));
 }
 useEffect(() => {
  void refreshProjects().catch(error => setNotice(String(error)));
  if (window.forge) void window.forge.oneai.get().then(saved => {
   setOneai(items => ({ ...items, baseUrl: saved.baseUrl, model: saved.model }));
   setOneaiStatus(saved.configured ? `UseOneAI conectada · ${saved.model}` : 'Configuração pendente');
  }).catch(error => setNotice(String(error)));
 }, []);
 useEffect(() => { if (active) void loadConversation(active).catch(error => setNotice(String(error))); }, [active]);

 async function select(kind: 'open' | 'create') {
  if (!window.forge) { setNotice('A seleção de pastas está disponível no aplicativo desktop.'); return; }
  try { const item = await window.forge.projects[kind](); if (item) { await refreshProjects(); setActive(item.id); setNotice(''); } }
  catch (error) { setNotice(String(error)); }
 }
 async function addRemote() {
  if (!window.forge || !remote.name.trim() || !remote.remoteUrl.trim()) { setNotice('Informe o nome e a URL do repositório.'); return; }
  try {
   const item = await window.forge.projects.addRemote({ name: remote.name.trim(), remoteUrl: remote.remoteUrl.trim(), branch: remote.branch.trim() || 'main' });
   await refreshProjects(); setActive(item.id); setRemoteModal(false); setRemote({ name: '', remoteUrl: '', branch: 'main' });
   setNotice('Repositório conectado. Sincronize uma cópia local para executar preview e testes.');
  } catch (error) { setNotice(String(error)); }
 }
 async function remove(id: string) {
  if (!window.forge) return;
  try { await window.forge.projects.remove(id); await refreshProjects(); setNotice('Projeto removido da lista. Os arquivos foram preservados.'); }
  catch (error) { setNotice(String(error)); }
 }
 async function persist(projectId: string, messages: Message[]) {
  if (!window.forge) return;
  const existing = await window.forge.conversations.list(projectId);
  const conversation: Conversation = existing[0] ?? await window.forge.conversations.create(projectId);
  await window.forge.conversations.save({ ...conversation, messages: messages.map(message => ({ id: crypto.randomUUID(), role: message.role, text: message.text, createdAt: new Date().toISOString() })), updatedAt: new Date().toISOString() });
 }
 async function send() {
  if (!project || !input.trim() || busy || !window.forge) return;
  if (!project.path) { setNotice('Este projeto está conectado ao GitHub, mas ainda não possui cópia local para preview e execução.'); return; }
  const id = project.id; const text = input.trim(); const before = histories[id] ?? []; const withUser = [...before, { role: 'user' as const, text }];
  setInput(''); setBusy(true); setHistories(items => ({ ...items, [id]: withUser }));
  try {
   const result = await window.forge.run(id, text);
   setPendingPlan(result.plan);
   const details = [result.message, ...(result.outputs ?? [])].filter(Boolean).join('\n');
   const withAgent = [...withUser, { role: 'agent' as const, text: details || 'Plano preparado. Revise as ações antes de executar.' }];
   setHistories(items => ({ ...items, [id]: withAgent })); await persist(id, withAgent);
  } catch (error) { setNotice(String(error)); await persist(id, withUser).catch(() => undefined); }
  finally { setBusy(false); }
 }
 async function executePending() {
  if (!project || !pendingPlan || busy || !window.forge) return;
  setBusy(true);
  try {
   const result = await window.forge.execute(project.id, pendingPlan);
   const current = histories[project.id] ?? [];
   const next = [...current, { role: 'agent' as const, text: [result.message, ...(result.outputs ?? [])].filter(Boolean).join('\n') }];
   setHistories(items => ({ ...items, [project.id]: next })); await persist(project.id, next); setPendingPlan(undefined);
  } catch (error) { setNotice(String(error)); }
  finally { setBusy(false); }
 }
 async function updates() { try { const result = await window.forge?.checkForUpdates(); setNotice(result?.message ?? (result?.status === 'dev' ? 'Atualizações automáticas só ficam ativas na versão instalada.' : 'Verificação de atualização solicitada.')); } catch (error) { setNotice(String(error)); } }
 async function openSettings() { setSettings(true); if (window.forge) { const saved = await window.forge.oneai.get(); setOneai(items => ({ ...items, baseUrl: saved.baseUrl, model: saved.model })); setOneaiStatus(saved.configured ? `UseOneAI conectada · ${saved.model}` : 'Nenhuma chave configurada.'); } }
 async function saveOneAI() { try { await window.forge?.oneai.save(oneai); setOneaiStatus(`UseOneAI conectada · ${oneai.model}`); } catch (error) { setOneaiStatus(String(error)); } }
 async function testOneAI() { try { const result = await window.forge?.oneai.test(); setOneaiStatus(result?.message ?? 'Não foi possível testar.'); } catch (error) { setOneaiStatus(String(error)); } }

 return <main className="app-shell">
  <aside className="sidebar"><div className="brand-row"><div className="brand-mark">F</div><div className="brand">Forge Agent</div></div>
   <button className="new-chat" disabled={busy} onClick={() => select('create')}>＋ Novo projeto</button>
   <button className="side-link" disabled={busy} onClick={() => select('open')}>Abrir pasta existente</button>
   <button className="side-link" disabled={busy} onClick={() => setRemoteModal(true)}>Conectar GitHub</button>
   <div className="side-label">PROJETOS</div><div className="project-list">{projects.map(item => <div className={'project-row ' + (item.id === active ? 'chosen' : '')} key={item.id}>
    <button className="project-name project-select" onClick={() => setActive(item.id)} title={item.path || item.remoteUrl}><b>{item.name}</b><small>{item.source === 'github' ? 'GitHub · ' + (item.branch ?? 'main') : 'Local'}</small></button>
    <button className="delete" disabled={busy} onClick={() => remove(item.id)} aria-label={'Remover ' + item.name + ' da lista'}>×</button>
   </div>)}</div>
   <div className="credits-card"><small>Integração de IA</small><span>{oneaiStatus || 'Configuração pendente'}</span><button onClick={openSettings}>Configurar UseOneAI</button><button onClick={updates} disabled={!window.forge}>Verificar atualização</button></div>
  </aside>
  <section className="workspace"><header className="topbar"><div className="project-crumb"><b>{project?.name ?? 'Escolha um projeto'}</b>{project && <span>· {sourceLabel}</span>}</div><div className="model-status">{oneai.model}</div><div className="top-actions"><button className="verify" onClick={executePending} disabled={!pendingPlan || busy}>{busy ? 'Executando…' : 'Executar plano'}</button><button className="run" onClick={send} disabled={!project || busy || !input.trim()}>{busy ? 'Analisando…' : 'Preparar plano'}</button></div></header>
   {notice && <div className="notice" role="status">{notice}<button aria-label="Fechar aviso" onClick={() => setNotice('')}>×</button></div>}
   <div className="workspace-grid"><section className="conversation-pane"><div className="conversation-title"><h1>Conversa</h1></div><div className="messages">{!(histories[active]?.length) && <p className="welcome">{project ? 'Descreva a alteração desejada para preparar um plano.' : 'Crie um projeto, abra uma pasta ou conecte um repositório para começar.'}</p>}{(histories[active] ?? []).map((message, index) => <div className={'message ' + message.role} key={index}><div className="avatar">{message.role === 'agent' ? 'F' : 'P'}</div><div className="message-body"><div className="message-meta"><b>{message.role === 'agent' ? 'Forge Agent' : 'Você'}</b></div><div className="bubble">{message.text}</div></div></div>)}</div><div className="composer"><textarea aria-label="Mensagem" value={input} onChange={event => setInput(event.target.value)} disabled={!project || busy} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} placeholder="Descreva o que deseja construir…"/><div className="composer-tools"><span>Enter para enviar · Shift+Enter para nova linha</span><button className="send" aria-label="Enviar" disabled={!project || busy || !input.trim()} onClick={send}>↑</button></div></div></section>
   <section className="build-pane"><div className="build-toolbar"><div className="view-tabs"><button className={tab === 'preview' ? 'selected' : ''} onClick={() => setTab('preview')}>Preview</button><button className={tab === 'checks' ? 'selected' : ''} onClick={() => setTab('checks')}>Verificações</button><button className={tab === 'project' ? 'selected' : ''} onClick={() => setTab('project')}>Projeto</button></div></div><div className="build-surface"><div className="deploy-empty">{tab === 'preview' ? <><b>Seu projeto, em funcionamento</b><span>{project?.path ? 'O preview será exibido após a execução do plano.' : 'Conecte ou crie um projeto para iniciar o preview.'}</span></> : tab === 'checks' ? <><b>Quality Gates</b><span>Testes de código, verificação visual e Reviewer Loop aparecerão aqui após a execução.</span></> : <><b>{project?.name ?? 'Nenhum projeto selecionado'}</b><span>{project?.remoteUrl ?? project?.path ?? 'Abra ou crie uma pasta na lateral.'}</span></>}</div></div></section></div>
  </section>
  {settings && <div className="settings-backdrop"><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button className="settings-close" onClick={() => setSettings(false)} aria-label="Fechar">×</button><h2 id="settings-title">Conectar UseOneAI</h2><p>A chave fica criptografada no computador e não aparece na conversa.</p><label>Endereço da API<input value={oneai.baseUrl} onChange={event => setOneai(items => ({ ...items, baseUrl: event.target.value }))}/></label><label>Chave da API<input type="password" value={oneai.apiKey} onChange={event => setOneai(items => ({ ...items, apiKey: event.target.value }))} placeholder="Cole sua chave aqui"/></label><label>Modelo<input value={oneai.model} onChange={event => setOneai(items => ({ ...items, model: event.target.value }))}/></label><div className="settings-actions"><button onClick={saveOneAI}>Salvar chave</button><button className="secondary" onClick={testOneAI}>Testar conexão</button></div>{oneaiStatus && <small className="settings-status">{oneaiStatus}</small>}</section></div>}
  {remoteModal && <div className="settings-backdrop"><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="remote-title"><button className="settings-close" onClick={() => setRemoteModal(false)} aria-label="Fechar">×</button><h2 id="remote-title">Conectar projeto GitHub</h2><p>O repositório fica registrado no workspace. A sincronização local será necessária para preview e testes.</p><label>Nome do projeto<input value={remote.name} onChange={event => setRemote(items => ({ ...items, name: event.target.value }))} placeholder="Meu projeto"/></label><label>URL do repositório<input value={remote.remoteUrl} onChange={event => setRemote(items => ({ ...items, remoteUrl: event.target.value }))} placeholder="https://github.com/organização/repositório"/></label><label>Branch<input value={remote.branch} onChange={event => setRemote(items => ({ ...items, branch: event.target.value }))}/></label><div className="settings-actions"><button onClick={addRemote}>Conectar repositório</button><button className="secondary" onClick={() => setRemoteModal(false)}>Cancelar</button></div></section></div>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);

