import { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'

export default function ChatInput({ onSend, loading, docs = [], selectedDoc, onDocSelect }) {
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
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      {/* Doc selector */}
      {docs.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          <button onClick={() => onDocSelect(null)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors
              ${!selectedDoc ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}>
            No PDF
          </button>
          {docs.map(d => (
            <button key={d.id} onClick={() => onDocSelect(d.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1
                ${selectedDoc === d.id ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}>
              <Paperclip className="w-3 h-3" />
              {d.filename.slice(0, 20)}{d.filename.length > 20 ? '...' : ''}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything... (Shift+Enter for new line)"
          rows={1}
          className="flex-1 input-base resize-none overflow-hidden min-h-[40px] max-h-32"
          style={{ height: 'auto' }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
          }}
          disabled={loading}
        />
        <button onClick={send} disabled={!input.trim() || loading}
          className="btn-primary px-3 py-2.5 flex items-center gap-1.5 flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-center">
        PrepAI can make mistakes. Verify important information.
      </p>
    </div>
  )
}
