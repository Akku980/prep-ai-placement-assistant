import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import {
  MessageSquare, FileText, Plus, Upload,
  ChevronRight, Trash2, Brain
} from 'lucide-react'

const MODES = [
  { id: 'dsa',    label: 'DSA Mentor',      emoji: '💻', desc: 'Coding problems & algorithms' },
  { id: 'hr',     label: 'HR Interview',     emoji: '🎤', desc: 'Behavioral & soft skills' },
  { id: 'resume', label: 'Resume Review',    emoji: '📄', desc: 'ATS & content improvements' },
  { id: 'cs',     label: 'CS Fundamentals',  emoji: '📚', desc: 'OS, DBMS, CN, OOP' },
  { id: 'mock',   label: 'Mock Interview',   emoji: '🎯', desc: 'Full interview simulation' },
  { id: 'general',label: 'General Chat',     emoji: '🤖', desc: 'Open placement guidance' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadStats()
    loadDocs()
  }, [])

  const loadStats = async () => {
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data)
    } catch {}
  }

  const loadDocs = async () => {
    try {
      const res = await api.get('/docs/')
      setDocs(res.data)
    } catch {}
  }

  const startChat = async (mode) => {
    try {
      const res = await api.post('/chats/', { title: 'New Chat', mode })
      navigate(`/chat/${res.data.id}`)
    } catch { toast.error('Failed to create chat') }
  }

  const uploadPdf = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    try {
      await api.post('/docs/upload', fd)
      toast.success(`${file.name} uploaded!`)
      loadDocs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const deleteDoc = async (id) => {
    await api.delete(`/docs/${id}`)
    setDocs(d => d.filter(doc => doc.id !== id))
    toast.success('Deleted')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ready to prep for placements?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.total_chats ?? '—'}</p>
            <p className="text-sm text-gray-500">Total Chats</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.total_docs ?? '—'}</p>
            <p className="text-sm text-gray-500">Uploaded PDFs</p>
          </div>
        </div>
      </div>

      {/* Modes */}
      <div className="mb-8">
        <h2 className="font-semibold mb-3">Start a session</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MODES.map(m => (
            <button key={m.id} onClick={() => startChat(m.id)}
              className="card text-left hover:border-indigo-400 hover:shadow-sm transition-all group p-4">
              <div className="text-2xl mb-2">{m.emoji}</div>
              <div className="font-medium text-sm mb-0.5">{m.label}</div>
              <div className="text-xs text-gray-400">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* PDF Upload */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">PDF Documents</h2>
          <label className="btn-primary flex items-center gap-1.5 cursor-pointer text-sm px-3 py-1.5">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload PDF'}
            <input type="file" accept=".pdf" className="hidden" onChange={uploadPdf} disabled={uploading} />
          </label>
        </div>

        {docs.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No PDFs uploaded yet</p>
            <p className="text-xs mt-1">Upload notes or your resume to ask questions from them</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map(doc => (
              <div key={doc.id} className="card flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <p className="text-xs text-gray-400">{doc.chunk_count} chunks · {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => deleteDoc(doc.id)} className="p-1.5 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent chats */}
      {stats?.recent_chats?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Recent Chats</h2>
          <div className="space-y-1">
            {stats.recent_chats.map(chat => (
              <button key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full card flex items-center justify-between py-3 px-4 hover:border-indigo-300 transition-colors text-left">
                <div className="flex items-center gap-2 min-w-0">
                  <Brain className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm truncate">{chat.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
