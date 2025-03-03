import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Brain, User } from 'lucide-react'
import { useState } from 'react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-gray-800'}`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Brain className="w-4 h-4 text-indigo-600" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
        ${isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:mt-3 prose-pre:p-0 prose-pre:bg-transparent"
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                if (!inline && match) {
                  return (
                    <div className="relative group my-2">
                      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
                        className="!rounded-lg !text-xs" {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                      <CopyButton text={String(children)} />
                    </div>
                  )
                }
                return (
                  <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                )
              }
            }}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}
