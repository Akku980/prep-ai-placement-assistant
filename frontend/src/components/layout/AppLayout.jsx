import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import toast from '../../utils/toast'

const MODES = {
  general: { label: 'AI Mentor',      emoji: '🤖' },
  dsa:     { label: 'DSA Mentor',     emoji: '💻' },
  hr:      { label: 'HR Interview',   emoji: '🎤' },
  resume:  { label: 'Resume Review',  emoji: '📄' },
  cs:      { label: 'CS Tutor',       emoji: '📚' },
  mock:    { label: 'Mock Interview', emoji: '🎯' },
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { chatId } = useParams()
  const [chats, setChats] = useState([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => { loadChats() }, [])

  const loadChats = async () => {
    try {
      const { data } = await api.get('/chats/')
      setChats(data)
    } catch { /* silent */ }
  }

  const newChat = useCallback(async (mode = 'general') => {
    try {
      const { data } = await api.post('/chats/', { title: 'New Chat', mode })
      setChats(c => [data, ...c])
      navigate(`/chat/${data.id}`)
    } catch { toast('Failed to create chat', 'error') }
  }, [navigate])

  const deleteChat = useCallback(async (e, id) => {
    e.stopPropagation()
    try {
      await api.delete(`/chats/${id}`)
      setChats(c => c.filter(ch => ch.id !== id))
      if (chatId === id) navigate('/dashboard')
    } catch { toast('Failed to delete', 'error') }
  }, [chatId, navigate])

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-brand-left">
              <div className="sb-icon">🧠</div>
              <span className="sb-name">PrepAI</span>
            </div>
            <button className="sb-toggle" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
              </svg>
            </button>
          </div>
          <button className="sb-new" onClick={() => newChat()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span>New Chat</span>
          </button>
        </div>

        <div className="sb-section">
          <span className="sb-label">Quick Start</span>
          <div className="mode-grid">
            {Object.entries(MODES).map(([id, m]) => (
              <button key={id} className="mode-chip" onClick={() => newChat(id)} title={m.label}>
                <span className="mode-chip-e">{m.emoji}</span>
                <span className="mode-chip-l">{m.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sb-section">
          <button className={`sb-nav${!chatId ? ' active' : ''}`} onClick={() => navigate('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <span>Dashboard</span>
          </button>
        </div>

        <div className="sb-history">
          <span className="sb-hist-label">Recent</span>
          {chats.length === 0 && <p style={{ fontSize:11, color:'var(--text3)', padding:'3px 4px' }}>No chats yet</p>}
          {chats.map(c => (
            <div key={c.id} className={`chat-row${c.id === chatId ? ' active' : ''}`} onClick={() => navigate(`/chat/${c.id}`)}>
              <span style={{ fontSize:12 }}>{MODES[c.mode]?.emoji || '🤖'}</span>
              <span className="chat-row-title">{c.title}</span>
              <button className="chat-row-del" onClick={e => deleteChat(e, c.id)} title="Delete">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span className="sb-username">{user?.name}</span>
          </div>
          <button className="sb-logout" onClick={logout} title="Sign out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="main-area">
        <Outlet context={{ chats, setChats, loadChats }} />
      </div>
    </div>
  )
}
