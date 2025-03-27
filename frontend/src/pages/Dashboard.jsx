import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'
import {
  MessageSquare, FileText, Upload, ChevronRight,
  Trash2, Brain, Zap, Target, TrendingUp, Clock
} from 'lucide-react'

const MODES = [
  { id:'dsa',    label:'DSA Mentor',     emoji:'💻', desc:'Algos & data structures', color:'from-violet-500/20 to-indigo-500/20', border:'border-violet-500/20 hover:border-violet-500/50' },
  { id:'hr',     label:'HR Interview',   emoji:'🎤', desc:'Behavioral questions',    color:'from-pink-500/20 to-rose-500/20',   border:'border-pink-500/20 hover:border-pink-500/50' },
  { id:'resume', label:'Resume Review',  emoji:'📄', desc:'ATS & bullet points',     color:'from-amber-500/20 to-orange-500/20',border:'border-amber-500/20 hover:border-amber-500/50' },
  { id:'cs',     label:'CS Tutor',       emoji:'📚', desc:'OS, DBMS, CN, OOP',       color:'from-emerald-500/20 to-teal-500/20',border:'border-emerald-500/20 hover:border-emerald-500/50' },
  { id:'mock',   label:'Mock Interview', emoji:'🎯', desc:'Full simulation',         color:'from-cyan-500/20 to-blue-500/20',   border:'border-cyan-500/20 hover:border-cyan-500/50' },
  { id:'general',label:'AI Mentor',      emoji:'🤖', desc:'General guidance',        color:'from-slate-500/20 to-gray-500/20',  border:'border-slate-500/20 hover:border-slate-500/50' },
]

const fadeUp = (delay=0) => ({
  initial:{ opacity:0, y:20 },
  animate:{ opacity:1, y:0 },
  transition:{ duration:0.4, delay }
})

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadStats(); loadDocs() }, [])

  const loadStats = async () => {
    try { const res = await api.get('/dashboard/stats'); setStats(res.data) } catch {}
  }
  const loadDocs = async () => {
    try { const res = await api.get('/docs/'); setDocs(res.data) } catch {}
  }

  const startChat = async (mode) => {
    try {
      const res = await api.post('/chats/', { title: 'New Chat', mode })
      navigate(`/chat/${res.data.id}`)
    } catch { toast.error('Failed to start session') }
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
    } finally { setUploading(false); e.target.value = '' }
  }

  const deleteDoc = async (id) => {
    await api.delete(`/docs/${id}`)
    setDocs(d => d.filter(doc => doc.id !== id))
    toast.success('Document deleted')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">

        {/* Welcome */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <h1 className="text-3xl font-bold">
            {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Ready to crack your placements?</p>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: MessageSquare, label: 'Total Chats', value: stats?.total_chats ?? '—', color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { icon: FileText,      label: 'Documents',   value: stats?.total_docs  ?? '—', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: Target,        label: 'Sessions',    value: stats?.total_chats ?? '—', color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
            { icon: TrendingUp,    label: 'Progress',    value: '↑',                        color: 'text-amber-400',   bg: 'bg-amber-500/10' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mode cards */}
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-white/80">Start a session</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MODES.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: 0.1 + i*0.05 }}
                onClick={() => startChat(m.id)}
                className={`p-4 rounded-2xl border bg-gradient-to-br ${m.color} ${m.border} text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group`}>
                <div className="text-2xl mb-2">{m.emoji}</div>
                <div className="font-semibold text-sm text-white/90 mb-0.5">{m.label}</div>
                <div className="text-xs text-white/40">{m.desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* PDF section */}
        <motion.div {...fadeUp(0.2)} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h2 className="font-semibold text-white/80">PDF Documents</h2>
              <span className="text-xs text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">{docs.length}</span>
            </div>
            <label className="btn-primary flex items-center gap-1.5 cursor-pointer text-xs px-3 py-2">
              <Upload className="w-3 h-3" />
              {uploading ? 'Uploading...' : 'Upload PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={uploadPdf} disabled={uploading} />
            </label>
          </div>

          {docs.length === 0 ? (
            <div className="card text-center py-10">
              <FileText className="w-8 h-8 mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/40">No documents yet</p>
              <p className="text-xs text-white/20 mt-1">Upload your resume or study notes to ask questions from them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className="card flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate">{doc.filename}</p>
                      <p className="text-xs text-white/30">{doc.chunk_count} chunks · {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteDoc(doc.id)} className="p-1.5 hover:text-red-400 transition-colors text-white/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent chats */}
        {stats?.recent_chats?.length > 0 && (
          <motion.div {...fadeUp(0.25)}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="font-semibold text-white/80">Recent Chats</h2>
            </div>
            <div className="space-y-1.5">
              {stats.recent_chats.map(chat => (
                <button key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)}
                  className="w-full card flex items-center justify-between py-3 px-4 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200 text-left group">
                  <div className="flex items-center gap-3 min-w-0">
                    <Brain className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">{chat.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
