import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/client'
import toast from 'react-hot-toast'
import {
  Brain, Plus, Trash2, Edit3, Check, X,
  Sun, Moon, LogOut, LayoutDashboard, ChevronLeft, ChevronRight
} from 'lucide-react'

const MODES = [
  { id: 'dsa',    label: 'DSA Mentor',       emoji: '💻' },
  { id: 'hr',     label: 'HR Interview',      emoji: '🎤' },
  { id: 'resume', label: 'Resume Review',     emoji: '📄' },
  { id: 'cs',     label: 'CS Fundamentals',   emoji: '📚' },
  { id: 'mock',   label: 'Mock Interview',    emoji: '🎯' },
  { id: 'general',label: 'General Assistant', emoji: '🤖' },
]

export default function Sidebar({ onNewChat }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
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

  const startRename = (e, chat) => {
    e.stopPropagation()
    setRenaming(chat.id)
    setRenameVal(chat.title)
  }

  const confirmRename = async (id) => {
    if (!renameVal.trim()) return
    await api.patch(`/chats/${id}`, { title: renameVal })
    setChats(c => c.map(ch => ch.id === id ? { ...ch, title: renameVal } : ch))
    setRenaming(null)
  }

  if (collapsed) return (
    <div className="w-14 h-full flex flex-col items-center py-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <button onClick={() => setCollapsed(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <ChevronRight className="w-4 h-4" />
      </button>
      <button onClick={() => newChat()} className="p-2 mt-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <Plus className="w-4 h-4" />
      </button>
      <div className="flex-1" />
      <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <div className="w-64 h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">PrepAI</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button onClick={() => newChat()} className="btn-primary w-full flex items-center justify-center gap-2 py-2">
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>

      {/* Modes */}
      <div className="px-3 pb-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">Modes</p>
        <div className="grid grid-cols-2 gap-1">
          {MODES.map(m => (
            <button key={m.id} onClick={() => newChat(m.id)}
              className="text-xs px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left truncate flex items-center gap-1">
              <span>{m.emoji}</span> <span className="truncate">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pb-2">
        <button onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">Recent</p>
        {chats.map(chat => (
          <div key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer mb-0.5 text-sm
              ${chatId === chat.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            {renaming === chat.id ? (
              <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                  className="flex-1 bg-transparent border-b border-indigo-500 outline-none text-sm px-0"
                  onKeyDown={e => { if(e.key==='Enter') confirmRename(chat.id); if(e.key==='Escape') setRenaming(null) }}
                  autoFocus />
                <button onClick={() => confirmRename(chat.id)}><Check className="w-3 h-3 text-green-500" /></button>
                <button onClick={() => setRenaming(null)}><X className="w-3 h-3 text-red-400" /></button>
              </div>
            ) : (
              <>
                <span className="flex-1 truncate">{chat.title}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button onClick={e => startRename(e, chat)} className="p-0.5 hover:text-indigo-500">
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button onClick={e => deleteChat(e, chat.id)} className="p-0.5 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm truncate">{user?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggle} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={logout} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
