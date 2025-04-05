import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from '../utils/toast'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const MODES = {
  general: { label:'AI Mentor',      emoji:'🤖' },
  dsa:     { label:'DSA Mentor',     emoji:'💻' },
  hr:      { label:'HR Interview',   emoji:'🎤' },
  resume:  { label:'Resume Review',  emoji:'📄' },
  cs:      { label:'CS Tutor',       emoji:'📚' },
  mock:    { label:'Mock Interview', emoji:'🎯' },
}

const STARTERS = {
  dsa:     ['Explain binary search with code','Solve Two Sum optimally','What is dynamic programming?','BFS vs DFS comparison'],
  hr:      ['Start a mock HR interview','Help me with "Tell me about yourself"','What is the STAR method?','Why should we hire you?'],
  resume:  ['Review my resume bullets','How to improve ATS score?','Skills to add for SDE roles','How to quantify achievements'],
  cs:      ['Explain OS deadlock','DBMS normalization types','TCP vs UDP difference','OOP pillars with examples'],
  mock:    ['Start full mock interview','SDE intern simulation','Data analyst mock','System design round'],
  general: ['How to crack TCS NQT?','SDE placement roadmap','Best DSA resources','How to prepare for Zoho?'],
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button className="copy-btn" onClick={() => {
      navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }}>{copied ? 'Copied!' : 'Copy'}</button>
  )
}

function Message({ msg, userInitial }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`msg-row ${msg.role}`}>
      <div className={`msg-av ${msg.role}`}>
        {isUser ? userInitial : '🧠'}
      </div>
      <div className={`msg-bubble ${msg.role}`}>
        {isUser ? (
          <p style={{ whiteSpace:'pre-wrap' }}>{msg.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                if (!inline && match) {
                  return (
                    <div style={{ position:'relative' }}>
                      <SyntaxHighlighter style={oneDark} language={match[1]}
                        customStyle={{ margin:0, borderRadius:10, fontSize:12 }} {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                      <CopyButton text={String(children)} />
                    </div>
                  )
                }
                return <code className={className} {...props}>{children}</code>
              }
            }}>
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const { setChats } = useOutletContext() || {}
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    if (chatId) { loadChat(); loadDocs() }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const loadChat = async () => {
    try {
      const [msgsRes, chatsRes] = await Promise.all([
        api.get(`/chats/${chatId}/messages`),
        api.get('/chats/'),
      ])
      setMessages(msgsRes.data)
      const found = chatsRes.data.find(c => c.id === chatId)
      if (found) setChat(found)
    } catch { toast('Failed to load chat', 'error') }
  }

  const loadDocs = async () => {
    try { const { data } = await api.get('/docs/'); setDocs(data) } catch {}
  }

  const send = useCallback(async (text) => {
    const content = text || input.trim()
    if (!content || busy) return
    setInput(''); setBusy(true)

    const tempMsg = { id: 'tmp', role: 'user', content }
    setMessages(m => [...m, tempMsg])

    try {
      const { data } = await api.post('/messages/', {
        chat_id: chatId,
        content,
        mode: chat?.mode || 'general',
        doc_id: selectedDoc || null,
      })
      setMessages(m => [...m.filter(x => x.id !== 'tmp'), { role:'user', content, id: Date.now() }, data])

      // Update chat title if auto-renamed
      if (chat?.title === 'New Chat') {
        const newTitle = content.slice(0,46) + (content.length > 46 ? '…' : '')
        setChat(c => ({ ...c, title: newTitle }))
        setChats?.(cs => cs.map(c => c.id === chatId ? { ...c, title: newTitle } : c))
      }
    } catch (err) {
      setMessages(m => m.filter(x => x.id !== 'tmp'))
      toast(err.response?.data?.detail || 'Failed to send message', 'error')
    } finally { setBusy(false); textRef.current?.focus() }
  }, [input, busy, chatId, chat, selectedDoc, setChats])

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const autoResize = e => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  const meta = MODES[chat?.mode] || MODES.general
  const starters = STARTERS[chat?.mode] || STARTERS.general
  const userInitial = user?.name?.[0]?.toUpperCase() || 'U'

  return (
    <div className="chat-view">
      {/* Topbar */}
      <div className="topbar">
        <div className="tb-badge">{meta.emoji}</div>
        <div>
          <div className="tb-title">{chat?.title || 'Loading…'}</div>
          <div className="tb-mode">{meta.label}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="msgs-area">
        <div className="msgs-inner">
          {messages.length === 0 && !busy && (
            <div className="empty-state">
              <div className="empty-icon">{meta.emoji}</div>
              <div className="empty-title">{meta.label}</div>
              <div className="empty-sub">
                {{
                  dsa:    "Share any coding problem — I'll walk through the optimal solution.",
                  hr:     "Let's practice behavioral questions with STAR feedback.",
                  resume: "Share your resume for ATS and impact improvements.",
                  cs:     "Ask anything about OS, DBMS, CN, OOP, or System Design.",
                  mock:   "Ready for a realistic mock interview — technical + HR.",
                  general:"Your AI placement mentor. Ask anything.",
                }[chat?.mode] || "Your AI placement mentor. Ask anything."}
              </div>
              <div className="starters">
                {starters.map(s => (
                  <button key={s} className="starter-btn" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={msg.id || i} msg={msg} userInitial={userInitial} />
          ))}

          {busy && (
            <div className="typing-row">
              <div className="msg-av ai">🧠</div>
              <div className="typing-bubble">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="input-area">
        {docs.length > 0 && (
          <div className="doc-pills">
            <button className={`doc-pill${!selectedDoc?' active':''}`} onClick={() => setSelectedDoc(null)}>No PDF</button>
            {docs.map(d => (
              <button key={d.id} className={`doc-pill${selectedDoc===d.id?' active':''}`}
                onClick={() => setSelectedDoc(d.id)}>
                📎 {d.filename.length > 20 ? d.filename.slice(0,20)+'…' : d.filename}
              </button>
            ))}
          </div>
        )}
        <div className="input-shell">
          <textarea
            ref={textRef}
            className="msg-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={autoResize}
            placeholder="Message PrepAI…"
            rows={1}
            disabled={busy}
          />
          <button className="send-btn" onClick={() => send()} disabled={!input.trim() || busy}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
        <div className="input-hint">PrepAI can make mistakes — verify important info.</div>
      </div>
    </div>
  )
}
