import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './overrides.css';

type Project = { id: number; name: string; path: string; mode: 'Novo' | 'Existente'; status: string };
type Message = { role: 'user' | 'agent'; text: string; time?: string };
type View = 'preview' | 'code' | 'deploy';

const skills = ['react-quality', 'typescript', 'browser-verifier', 'debugging', 'security-review', 'reviewer-loop'];
const initialProjects: Project[] = [{ id: 1, name: 'Meu primeiro projeto', path: 'Ainda não configurado', mode: 'Novo', status: 'Rascunho' }];

function App() {
  const [projects, setProjects] = useState<Project[]>(() => { try { return JSON.parse(localStorage.getItem('forge-projects') || '') as Project[] || initialProjects; } catch { return initialProjects; } });
  const [active, setActive] = useState(1);
  const [messages, setMessages] = useState<Message[]>([{ role: 'agent', text: 'Olá! Sou o Forge Agent. Descreva o que você quer construir ou use @ para ativar uma Skill.', time: 'agora' }]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'Novo' | 'Existente'>('Novo');
  const [view, setView] = useState<View>('preview');
  const [preview, setPreview] = useState('A visualização aparecerá aqui quando o agente iniciar um projeto.');
  const [busy, setBusy] = useState(false);
  const current = projects.find((p) => p.id === active) || projects[0];
  const mentions = useMemo(() => skills.filter((skill) => input.includes(`@${skill}`)), [input]);
  function persist(next: Project[]) { setProjects(next); localStorage.setItem('forge-projects', JSON.stringify(next)); }
  function addProject() { const id = Date.now(); const next = [...projects, { id, name: `Projeto ${projects.length + 1}`, path: 'Ainda não configurado', mode, status: 'Rascunho' }]; persist(next); setActive(id); setMessages([{ role: 'agent', text: 'Novo projeto criado. O que vamos construir?', time: 'agora' }]); }
  function deleteProject(id: number) { if (projects.length === 1) return; const next = projects.filter((project) => project.id !== id); persist(next); if (active === id) setActive(next[0].id); }
  async function send() { if (!input.trim() || busy) return; const text = input.trim(); setInput(''); setMessages((items) => [...items, { role: 'user', text, time: 'agora' }]); setBusy(true); try { const result = window.forge ? await window.forge.run(text) : { message: 'Plano preparado para revisão.', outputs: ['Quality Gates de código e interface incluídos.'] }; setMessages((items) => [...items, { role: 'agent', text: [result.message, ...(result.outputs || [])].join('\n'), time: 'agora' }]); setPreview('Preview preparado. Quality Gates e verificação visual aguardando execução.'); } catch (error) { setMessages((items) => [...items, { role: 'agent', text: String(error), time: 'agora' }]); } finally { setBusy(false); } }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand-row"><div className="brand-mark">♥</div><div className="brand">Forge Agent</div><button className="collapse">←</button></div>
      <button className="new-chat" onClick={addProject}>＋ <span>Novo projeto</span><kbd>⌘ N</kbd></button>
      <nav className="main-nav"><button className="side-link">⌂ <span>Início</span></button><button className="side-link active">▣ <span>Conversas</span></button><button className="side-link">◇ <span>Projetos</span></button><button className="side-link">◉ <span>Modelos</span></button><button className="side-link">⌘ <span>Integrações</span></button><button className="side-link">▤ <span>Biblioteca</span></button><button className="side-link">⚙ <span>Configurações</span></button></nav>
      <div className="side-label">PROJETOS RECENTES <button onClick={addProject}>＋</button></div>
      <div className="project-list">{projects.map((project) => <div className={`project-row ${project.id === active ? 'chosen' : ''}`} key={project.id} onClick={() => setActive(project.id)}><div className="project-file">▧</div><div className="project-name"><b>{project.name}</b><small>{project.mode} · {project.status}</small></div><button className="delete" title="Excluir projeto" onClick={(event) => { event.stopPropagation(); deleteProject(project.id); }}>×</button></div>)}</div>
      <button className="view-all">Ver todos →</button>
      <div className="credits-card"><small>Créditos de IA</small><div className="credit-bar"><i /></div><span>Configuração pendente</span><button>Configurar modelo</button></div>
    </aside>
    <section className="workspace">
      <header className="topbar"><div className="project-crumb">▣ <span>/</span> <b>{current?.name || 'Novo projeto'}</b>⌄</div><div className="model-status"><i /> Modelo: UseOneAI <em>Online</em></div><div className="top-actions"><button className="verify">✓ Verificar</button><button className="run" onClick={send}>▶ Executar</button><button className="more">•••</button><div className="user-badge">PA</div></div></header>
      <div className="workspace-grid">
        <section className="conversation-pane"><div className="conversation-title"><h1>Conversa</h1><div className="conversation-actions"><button>⌕</button><button>＋</button><button>□</button></div></div><div className="messages">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.time}-${index}`}><div className="avatar">{message.role === 'agent' ? '♥' : 'Você'}</div><div className="message-body"><div className="message-meta"><b>{message.role === 'agent' ? 'Forge Agent' : 'Você'}</b><small>{message.time}</small></div><div className="bubble">{message.text}</div>{message.role === 'agent' && index === messages.length - 1 && <div className="progress-list"><span>✓ Analisando contexto</span><span>✓ Quality Gates preparados</span><span>○ Aguardando execução</span></div>}</div></div>)}</div><div className="composer"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Digite uma mensagem... Use @ para acionar uma Skill"/><div className="composer-tools"><button>⌕</button><button>@</button><button>▧</button><span>{mentions.length ? `Ativas: ${mentions.join(', ')}` : 'Enter para enviar · Shift+Enter para nova linha'}</span><button className="send" onClick={send} disabled={busy}>↑</button></div></div></section>
        <section className="build-pane"><div className="build-toolbar"><div className="view-tabs"><button className={view === 'code' ? 'selected' : ''} onClick={() => setView('code')}>‹/› Código</button><button className={view === 'preview' ? 'selected' : ''} onClick={() => setView('preview')}>◉ Preview ao vivo</button><button className={view === 'deploy' ? 'selected' : ''} onClick={() => setView('deploy')}>♢ Deploy</button></div><div className="preview-controls"><button>▣</button><button>▯</button><input value="http://localhost:5173" readOnly/><button>↻</button></div></div><div className={`build-surface ${view}`}>{view === 'preview' && <><div className="preview-site"><div className="site-nav"><b><span>♥</span> Forge Agent</b><div><a>Recursos</a><a>Preços</a><a>Documentação</a><button>Começar grátis</button></div></div><div className="site-hero"><div><small className="powered">● Powered by Forge Agent</small><h2>Da ideia ao produto,<br/>mais rápido.</h2><p>Converse, construa, teste e lance seu software em um só lugar.</p><button>Começar grátis →</button><button className="demo">▷ Ver demonstração</button></div><div className="site-code"><div className="code-title">Conversa <span>App.tsx　＋</span></div><pre>{`import { useState } from 'react'\n\nexport default function App() {\n  const [idea, setIdea] = useState('')\n\n  return (\n    <main className="min-h-screen">\n      <h1>Da ideia ao produto</h1>\n    </main>\n  )\n}`}</pre><div className="code-state">✓ Tudo pronto!</div></div></div><div className="site-features"><b>Tudo que você precisa para construir melhor.</b><div><span>✦ Criação assistida</span><span>‹/› Workspace integrado</span><span>◉ Feito para times</span></div></div></div><aside className="verification"><b>Verificações</b><span>✓ Testes de código <small>pronto</small></span><span>○ Fluxo visual <small>aguardando</small></span><span>○ Reviewer Loop <small>aguardando</small></span></aside></>}{view === 'code' && <pre className="editor-preview">{`// O editor será conectado ao projeto selecionado\n// quando o workspace local for configurado.\n\n${preview}`}</pre>}{view === 'deploy' && <div className="deploy-empty"><b>Deploy preparado</b><span>Configure um provedor para publicar este projeto com segurança.</span><button>Configurar integração</button></div>}</div></section>
      </div>
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);

