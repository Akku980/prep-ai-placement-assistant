import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      className="flex gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-violet-400" />
      </div>
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 typing-dot" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
