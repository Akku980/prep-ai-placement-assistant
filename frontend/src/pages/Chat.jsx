import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/client'
import ChatMessage from '../components/chat/ChatMessage'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

const MODE_META = {
  dsa:    { label:'DSA Mentor',       emoji:'💻', color:'text-violet-400', bg:'bg-violet-500/10' },
  hr:     { label:'HR Interview',     emoji:'🎤', color:'text-pink-400',   bg:'bg-pink-500/10' },
  resume: { label:'Resume Review',    emoji:'📄', color:'text-amber-400',  bg:'bg-amber-500/10' },
  cs:     { label:'CS Tutor',         emoji:'📚', color:'text-emerald-400',bg:'bg-emerald-500/10' },
  mock:   { label:'Mock Interview',   emoji:'🎯', color:'text-cyan-400',   bg:'bg-cyan-500/10' },
  general:{ label:'AI Mentor',        emoji:'🤖', color:'text-slate-400',  bg:'bg-slate-500/10' },
}

const STARTERS = {
  dsa:    ['Explain binary search with code','What is dynamic programming?','Solve two sum optimally','Explain BFS vs DFS'],
  hr:     ['Tell me about yourself','Why should we hire you?','What are your strengths & weaknesses?','Describe a challenge you faced'],
  resume: ['Review my resume bullet points','How to improve ATS score?','What skills should I add?','How to quantify my achievements?'],
  cs:     ['Explain OS deadlock','DBMS normalization types','TCP vs UDP difference','Explain OOPS pillars'],
  mock:   ['Start a mock interview for SDE','Interview for data analyst role','Technical round simulation','Ask me system design'],
  general:['How to prepare for placements?','Best DSA resources for beginners','How to crack TCS NQT?','Roadmap for software engineer'],
}

export default function Chat() {
  const { chatId } = useParams()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (chatId) { loadData() }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 1 ? 'smooth' : 'instant' })
  }, [messages, loading])

  const loadData = async () => {
    setInitialLoad(true)
    try {
      const [msgsRes, chatsRes, docsRes] = await Promise.all([
        api.get(`/chats/${chatId}/messages`),
        api.get('/chats/'),
        api.get('/docs/'),
      ])
      setMessages(msgsRes.data)
      setDocs(docsRes.data)
      const found = chatsRes.data.find(c => c.id === chatId)
      if (found) setChat(found)
    } catch {
      toast.error('Failed to load chat')
    } finally {
      setInitialLoad(false)
    }
  }

  const sendMessage = useCallback(async (content) => {
    const tempId = `temp-${Date.now()}`
    const userMsg = { id: tempId, role: 'user', content }
    setMessages(m => [...m, userMsg])
    setLoading(true)
    try {
      const res = await api.post('/messages/', {
        chat_id: chatId,
        content,
        mode: chat?.mode || 'general',
        doc_id: selectedDoc || null,
      })
      setMessages(m => [...m, res.data])
      if (chat?.title === 'New Chat') {
        setChat(c => ({ ...c, title: content.slice(0, 40) + (content.length > 40 ? '…' : '') }))
      }
    } catch (err) {
      setMessages(m => m.filter(msg => msg.id !== tempId))
      toast.error(err.response?.data?.detail || 'Failed — check if backend is running')
    } finally {
      setLoading(false)
    }
  }, [chatId, chat, selectedDoc])

  const meta = MODE_META[chat?.mode] || MODE_META.general
  const starters = STARTERS[chat?.mode] || STARTERS.general

  if (initialLoad) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#080B14]">
        <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center text-lg`}>
          {meta.emoji}
        </div>
        <div>
          <h2 className="font-semibold text-sm text-white/90 truncate max-w-xs">{chat?.title || '…'}</h2>
          <p className={`text-xs ${meta.color}`}>{meta.label}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
              className={`text-5xl mb-4`}>{meta.emoji}</motion.div>
            <motion.h3 initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="font-bold text-xl text-white mb-2">{meta.label}</motion.h3>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
              className="text-sm text-white/40 mb-8 max-w-sm leading-relaxed">
              {chat?.mode==='dsa' && "Share any coding problem and I'll walk through the optimal solution with you."}
              {chat?.mode==='hr' && "Let's practice behavioral questions. I'll give structured feedback on each answer."}
              {chat?.mode==='resume' && "Share your resume or bullet points and I'll give you specific ATS improvements."}
              {chat?.mode==='cs' && "Ask anything about OS, DBMS, CN, OOP, or System Design — interview-focused answers."}
              {chat?.mode==='mock' && "I'll conduct a realistic mock interview — technical + HR. Ready when you are."}
              {(!chat?.mode || chat?.mode==='general') && "Your AI placement mentor. Ask anything about jobs, prep, or your career."}
            </motion.p>
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="flex flex-wrap gap-2 justify-center max-w-lg">
              {starters.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10 text-white/50 hover:text-white/80 transition-all duration-200 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> {s}
                </button>
              ))}
            </motion.div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        </AnimatePresence>
        {loading && <TypingIndicator />}
        <div ref={bottomRef} className="h-4" />
      </div>

      <ChatInput onSend={sendMessage} loading={loading} docs={docs} selectedDoc={selectedDoc} onDocSelect={setSelectedDoc} />
    </div>
  )
}
