import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Brain, User } from 'lucide-react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 opacity-0 group-hover:opacity-100 transition-all">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser
          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30'
          : 'bg-white/[0.06] border border-white/[0.08]'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Brain className="w-4 h-4 text-violet-400" />}
      </div>

      <div className={`max-w-[78%] text-sm rounded-2xl px-4 py-3
        ${isUser
          ? 'bg-gradient-to-br from-violet-600/80 to-indigo-600/80 text-white rounded-tr-sm backdrop-blur-sm border border-violet-500/30'
          : 'bg-white/[0.04] border border-white/[0.08] text-white/85 rounded-tl-sm'}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:text-white prose-pre:p-0 prose-pre:bg-transparent prose-code:text-violet-300 prose-strong:text-white"
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                if (!inline && match) {
                  return (
                    <div className="relative group my-3">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.06] rounded-t-lg border border-white/[0.08] border-b-0">
                        <span className="text-xs text-white/40 font-mono">{match[1]}</span>
                        <CopyButton text={String(children)} />
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  )
                }
                return <code className="bg-white/[0.08] px-1.5 py-0.5 rounded text-xs font-mono text-violet-300" {...props}>{children}</code>
              },
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
              li: ({ children }) => <li className="text-white/80">{children}</li>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-violet-500/50 pl-3 my-2 text-white/60 italic">{children}</blockquote>,
              h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold text-white mt-3 mb-1.5">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold text-white/90 mt-2 mb-1">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}
