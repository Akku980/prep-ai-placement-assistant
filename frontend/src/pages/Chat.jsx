import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import ChatMessage from '../components/chat/ChatMessage'
import ChatInput from '../components/chat/ChatInput'
import TypingIndicator from '../components/chat/TypingIndicator'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

const MODE_LABELS = {
  dsa: '💻 DSA Mentor', hr: '🎤 HR Interview', resume: '📄 Resume Review',
  cs: '📚 CS Fundamentals', mock: '🎯 Mock Interview', general: '🤖 General'
}

const STARTERS = {
  dsa: ['Explain binary search with code', 'What is dynamic programming?', 'Solve two sum problem'],
  hr: ['Tell me about yourself', 'Why should we hire you?', 'What are your strengths?'],
  resume: ['Review my resume bullet points', 'How to improve ATS score?', 'Best skills to add for SDE roles'],
  cs: ['Explain OS deadlock', 'DBMS normalization basics', 'TCP vs UDP difference'],
  mock: ['Start a mock interview', 'Interview for SDE intern role', 'Ask me a system design question'],
  general: ['How to prepare for placements?', 'Best DSA resources', 'How to crack TCS NQT?'],
}

export default function Chat() {
  const { chatId } = useParams()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (chatId) {
      loadMessages()
      loadDocs()
    }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadMessages = async () => {
    try {
      const [msgsRes, chatsRes] = await Promise.all([
        api.get(`/chats/${chatId}/messages`),
        api.get('/chats/')
      ])
      setMessages(msgsRes.data)
      const found = chatsRes.data.find(c => c.id === chatId)
      if (found) setChat(found)
    } catch {
      toast.error('Failed to load messages')
    }
  }

  const loadDocs = async () => {
    try {
      const res = await api.get('/docs/')
      setDocs(res.data)
    } catch {}
  }

  const sendMessage = async (content) => {
    const userMsg = { id: Date.now(), role: 'user', content }
    setMessages(m => [...m, userMsg])
    setLoading(true)
    try {
      const res = await api.post('/messages/', {
        chat_id: chatId,
        content,
        mode: chat?.mode || 'general',
        doc_id: selectedDoc || null
      })
      setMessages(m => [...m.slice(0, -1), userMsg, res.data])
      // update chat title if auto-renamed
      if (chat?.title === 'New Chat') {
        setChat(c => ({ ...c, title: content.slice(0, 40) }))
      }
    } catch (err) {
      setMessages(m => m.filter(msg => msg.id !== userMsg.id))
      toast.error(err.response?.data?.detail || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const starters = STARTERS[chat?.mode] || STARTERS.general

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div>
          <h2 className="font-semibold text-sm truncate max-w-xs">{chat?.title || 'Loading...'}</h2>
          <p className="text-xs text-gray-400">{MODE_LABELS[chat?.mode] || '🤖 General'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="text-4xl mb-3">{MODE_LABELS[chat?.mode]?.split(' ')[0] || '🤖'}</div>
            <h3 className="font-semibold text-lg mb-1">{MODE_LABELS[chat?.mode]?.slice(2) || 'PrepAI'}</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              {chat?.mode === 'dsa' && 'Share a problem and I\'ll walk you through it step by step.'}
              {chat?.mode === 'hr' && 'Let\'s practice behavioral and HR interview questions together.'}
              {chat?.mode === 'resume' && 'Share your resume or bullet points for detailed feedback.'}
              {chat?.mode === 'cs' && 'Ask anything about OS, DBMS, CN, OOP or System Design.'}
              {chat?.mode === 'mock' && 'Ready to conduct a realistic mock interview. Let\'s go!'}
              {(!chat?.mode || chat?.mode === 'general') && 'Your AI placement companion. Ask me anything!'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {starters.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        loading={loading}
        docs={docs}
        selectedDoc={selectedDoc}
        onDocSelect={setSelectedDoc}
      />
    </div>
  )
}
