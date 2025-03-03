import { Brain } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 typing-dot" />
          ))}
        </div>
      </div>
    </div>
  )
}
