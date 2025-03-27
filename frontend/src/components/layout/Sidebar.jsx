import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import toast from 'react-hot-toast'
import {
  Brain, Plus, Trash2, Edit3, Check, X,
  LogOut, LayoutDashboard, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'

const MODES = [
  { id: 'dsa',    label: 'DSA Mentor',       emoji: '💻', color: 'from-violet-500 to-indigo-500' },
  { id: 'hr',     label: 'HR Interview',      emoji: '🎤', color: 'from-pink-500 to-rose-500' },
  { id: 'resume', label: 'Resume Review',     emoji: '📄', color: 'from-amber-500 to-orange-500' },
  { id: 'cs',     label: 'CS Tutor',          emoji: '📚', color: 'from-emerald-500 to-teal-500' },
  { id: 'mock',   label: 'Mock Interview',    emoji: '🎯', color: 'from-cyan-500 to-blue-500' },
  { id: 'general',label: 'AI Mentor',         emoji: '🤖', color: 'from-slate-500 to-gray-500' },
]

export default function Sidebar({ onNewChat }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { chatId } = useParams()
  const [chats, setChats] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [renaming, setRenaming] = useState(null)
  const [renameVal, setRenameVal] = useState('')

  useEffect(() => { loadChats() }, [])

  const loadChats = async () => {
    try {
      const res = await api.get('/chats/')
      setChats(res.data)
    } catch {}
  }

  const newChat = async (mode = 'general') => {
    try {
      const res = await api.post('/chats/', { title: 'New Chat', mode })
      setChats(c => [res.data, ...c])
      navigate(`/chat/${res.data.id}`)
      onNewChat?.()
    } catch { toast.error('Failed to create chat') }
  }

  const deleteChat = async (e, id) => {
    e.stopPropagation()
    await api.delete(`/chats/${id}`)
    setChats(c => c.filter(ch => ch.id !== id))
    if (chatId === id) navigate('/dashboard')
  }

  const confirmRename = async (id) => {
    if (!renameVal.trim()) return
    await api.patch(`/chats/${id}`, { title: renameVal })
    setChats(c => c.map(ch => ch.id === id ? { ...ch, title: renameVal } : ch))
    setRenaming(null)
  }

  if (collapsed) return (
    <div className="w-14 h-full flex flex-col items-center py-4 border-r border-white/[0.06] bg-[#080B14]">
      <button onClick={() => setCollapsed(false)} className="p-2 rounded-xl btn-ghost mb-2">
        <ChevronRight className="w-4 h-4" />
      </button>
      <button onClick={() => newChat()} className="p-2 rounded-xl btn-ghost">
        <Plus className="w-4 h-4" />
      </button>
      <div className="flex-1" />
      <button onClick={logout} className="p-2 rounded-xl btn-ghost"><LogOut className="w-4 h-4" /></button>
    </div>
  )

  return (
    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      className="w-64 h-full flex flex-col border-r border-white/[0.06] bg-[#080B14]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">PrepAI</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1.5 rounded-lg btn-ghost">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button onClick={() => newChat()}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>

      {/* Mode quick-launch */}
      <div className="px-3 pb-3">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 px-1">Quick Start</p>
        <div className="grid grid-cols-3 gap-1">
          {MODES.map(m => (
            <button key={m.id} onClick={() => newChat(m.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/[0.05] transition-all duration-200 group">
              <span className="text-lg">{m.emoji}</span>
              <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors text-center leading-tight">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      <div className="px-3 pb-2">
        <button onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm btn-ghost">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 px-1">History</p>
        <AnimatePresence>
          {chats.map((chat, i) => (
            <motion.div key={chat.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer mb-0.5 text-sm transition-all duration-200
                ${chatId === chat.id
                  ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                  : 'hover:bg-white/[0.04] text-white/60 hover:text-white/90'}`}>
              {renaming === chat.id ? (
                <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    className="flex-1 bg-transparent border-b border-violet-500/60 outline-none text-sm text-white px-0"
                    onKeyDown={e => { if(e.key==='Enter') confirmRename(chat.id); if(e.key==='Escape') setRenaming(null) }}
                    autoFocus />
                  <button onClick={() => confirmRename(chat.id)}><Check className="w-3 h-3 text-emerald-400" /></button>
                  <button onClick={() => setRenaming(null)}><X className="w-3 h-3 text-red-400" /></button>
                </div>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 flex-shrink-0 opacity-40" />
                  <span className="flex-1 truncate text-xs">{chat.title}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button onClick={e => { e.stopPropagation(); setRenaming(chat.id); setRenameVal(chat.title) }}
                      className="p-1 hover:text-violet-400 transition-colors"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={e => deleteChat(e, chat.id)}
                      className="p-1 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {chats.length === 0 && (
          <p className="text-xs text-white/20 text-center py-4">No chats yet</p>
        )}
      </div>

      {/* User footer */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{user?.name}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/[0.06] hover:text-red-400 transition-all text-white/40">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
