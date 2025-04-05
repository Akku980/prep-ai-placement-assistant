import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from '../utils/toast'

const MODES = [
  { id:'dsa',    emoji:'💻', title:'DSA Mentor',      desc:'Algorithms, data structures, optimal solutions' },
  { id:'hr',     emoji:'🎤', title:'HR Interview',     desc:'Behavioral prep, STAR method, communication' },
  { id:'resume', emoji:'📄', title:'Resume Review',    desc:'ATS optimization, bullet rewrites' },
  { id:'cs',     emoji:'📚', title:'CS Tutor',         desc:'OS, DBMS, CN, OOP — interview-ready answers' },
  { id:'mock',   emoji:'🎯', title:'Mock Interview',   desc:'Full simulation with scoring and feedback' },
  { id:'general',emoji:'🤖', title:'AI Mentor',        desc:'Roadmaps, company research, placement strategy' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { chats = [], setChats, loadChats } = useOutletContext() || {}
  const [docs, setDocs] = useState([])
  const [stats, setStats] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadStats(); loadDocs() }, [])

  const loadStats = async () => {
    try { const { data } = await api.get('/dashboard/stats'); setStats(data) } catch {}
  }

  const loadDocs = async () => {
    try { const { data } = await api.get('/docs/'); setDocs(data) } catch {}
  }

  const startChat = async (mode) => {
    try {
      const { data } = await api.post('/chats/', { title: 'New Chat', mode })
      setChats?.(c => [data, ...c])
      navigate(`/chat/${data.id}`)
    } catch { toast('Failed to start session', 'error') }
  }

  const uploadPdf = async (e) => {
    const file = e.target.files[0]; if (!file) return
    e.target.value = ''
    const fd = new FormData(); fd.append('file', file)
    setUploading(true)
    try {
      await api.post('/docs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast(`${file.name} uploaded`, 'success')
      loadDocs()
    } catch (err) {
      toast(err.response?.data?.detail || 'Upload failed', 'error')
    } finally { setUploading(false) }
  }

  const deletePdf = async (id) => {
    try { await api.delete(`/docs/${id}`); setDocs(d => d.filter(x => x.id !== id)) }
    catch { toast('Delete failed', 'error') }
  }

  const h = new Date().getHours()
  const greeting = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <h1>Good <span className="dash-grad">{greeting}</span>, <span className="dash-grad">{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p>Your AI placement preparation hub</p>
      </div>

      <div className="stats-grid">
        {[
          { icon:'💬', num: stats?.total_chats ?? chats.length, label:'Chats' },
          { icon:'📄', num: stats?.total_docs  ?? docs.length,  label:'Documents' },
          { icon:'⚡', num: stats?.total_msgs  ?? '—',          label:'Messages' },
          { icon:'🎯', num: 6,                                   label:'AI Modes' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-num">{s.num}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Start a session</div>
      <div className="modes-grid">
        {MODES.map(m => (
          <div key={m.id} className="mode-card" onClick={() => startChat(m.id)}>
            <div className="mode-card-emoji">{m.emoji}</div>
            <div className="mode-card-title">{m.title}</div>
            <div className="mode-card-desc">{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="pdf-row-header">
        <span className="section-label" style={{ marginBottom:0 }}>Documents</span>
        <label className="upload-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          {uploading ? 'Uploading…' : 'Upload PDF'}
          <input type="file" accept=".pdf" style={{ display:'none' }} onChange={uploadPdf} disabled={uploading} />
        </label>
      </div>

      <div className="pdf-list">
        {docs.length === 0
          ? <div className="no-pdf">No documents yet — upload your resume or study notes</div>
          : docs.map(d => (
            <div key={d.id} className="pdf-item">
              <div className="pdf-item-icon">📄</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="pdf-item-name">{d.filename}</div>
                <div className="pdf-item-meta">{d.chunk_count} chunks · {new Date(d.uploaded_at).toLocaleDateString()}</div>
              </div>
              <button className="pdf-del" onClick={() => deletePdf(d.id)} title="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                </svg>
              </button>
            </div>
          ))
        }
      </div>

      {chats.length > 0 && (
        <>
          <div className="section-label">Recent chats</div>
          <div className="recent-list">
            {chats.slice(0,5).map(c => (
              <div key={c.id} className="recent-row" onClick={() => navigate(`/chat/${c.id}`)}>
                <span style={{ fontSize:15 }}>{['💻','🎤','📄','📚','🎯','🤖'][['dsa','hr','resume','cs','mock','general'].indexOf(c.mode)] || '🤖'}</span>
                <span className="recent-row-title">{c.title}</span>
                <svg width="12" height="12" style={{ color:'var(--text3)', flexShrink:0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
