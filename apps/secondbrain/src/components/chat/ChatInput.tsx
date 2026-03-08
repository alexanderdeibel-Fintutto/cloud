import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Frag dein SecondBrain..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground min-h-[36px] py-1.5"
        />
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" type="button">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
      <Button
        size="icon"
        className="h-11 w-11 rounded-xl shrink-0"
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}
