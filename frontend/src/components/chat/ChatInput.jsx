import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Loader2 } from 'lucide-react'

export default function ChatInput({ onSend, loading, docs=[], selectedDoc, onDocSelect }) {
  const [input, setInput] = useState('')
  const textRef = useRef(null)

  const send = () => {
    if (!input.trim() || loading) return
    onSend(input.trim())
    setInput('')
    textRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="border-t border-white/[0.06] bg-[#080B14] px-4 py-3">
      {docs.length > 0 && (
        <div className="flex gap-2 mb-2.5 flex-wrap">
          <button onClick={() => onDocSelect(null)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200
              ${!selectedDoc ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
            No PDF
          </button>
          {docs.map(d => (
            <button key={d.id} onClick={() => onDocSelect(d.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 flex items-center gap-1
                ${selectedDoc===d.id ? 'bg-violet-600/30 border-violet-500/50 text-violet-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
              <Paperclip className="w-2.5 h-2.5" />
              {d.filename.length > 18 ? d.filename.slice(0,18)+'…' : d.filename}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything... (Shift+Enter for new line)"
            rows={1}
            disabled={loading}
            className="input-base resize-none min-h-[44px] max-h-36 pr-4 py-3"
            style={{ height:'auto' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px'
            }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={send} disabled={!input.trim() || loading}
          className="btn-primary px-3.5 py-3 flex items-center gap-1.5 flex-shrink-0 h-[44px]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </motion.button>
      </div>
      <p className="text-[11px] text-white/20 mt-2 text-center">
        PrepAI can make mistakes. Verify important info.
      </p>
    </div>
  )
}
