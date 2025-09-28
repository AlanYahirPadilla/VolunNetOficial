"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Smile, Heart, ThumbsUp, Laugh, Angry, Frown } from 'lucide-react'

interface MessageReactionsProps {
  messageId: string
  reactions: { [emoji: string]: string[] } // emoji -> array of user IDs
  currentUserId: string
  onReactionToggle: (messageId: string, emoji: string) => void
}

const quickReactions = [
  { emoji: '👍', icon: ThumbsUp, label: 'Me gusta' },
  { emoji: '❤️', icon: Heart, label: 'Amor' },
  { emoji: '😂', icon: Laugh, label: 'Risa' },
  { emoji: '😢', icon: Frown, label: 'Triste' },
  { emoji: '😡', icon: Angry, label: 'Enojado' },
  { emoji: '😮', icon: Smile, label: 'Sorpresa' }
]

export function MessageReactions({ 
  messageId, 
  reactions, 
  currentUserId, 
  onReactionToggle 
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleReactionClick = (emoji: string) => {
    onReactionToggle(messageId, emoji)
  }

  const getReactionCount = (emoji: string) => {
    return reactions[emoji]?.length || 0
  }

  const hasUserReacted = (emoji: string) => {
    return reactions[emoji]?.includes(currentUserId) || false
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Quick Reactions */}
      {quickReactions.map(({ emoji, icon: Icon, label }) => {
        const count = getReactionCount(emoji)
        const isActive = hasUserReacted(emoji)
        
        if (count === 0) return null

        return (
          <motion.div
            key={emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReactionClick(emoji)}
              className={`h-6 px-2 py-1 text-xs rounded-full transition-colors ${
                isActive 
                  ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm mr-1">{emoji}</span>
              <span className="text-xs font-medium">{count}</span>
            </Button>
          </motion.div>
        )
      })}

      {/* Add Reaction Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        className="h-6 w-6 p-0 hover:bg-gray-100 text-gray-400"
      >
        <Smile className="h-3 w-3" />
      </Button>

      {/* Reaction Picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-8 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50"
          >
            <div className="flex gap-1">
              {quickReactions.map(({ emoji, icon: Icon, label }) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleReactionClick(emoji)
                    setShowPicker(false)
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title={label}
                >
                  <span className="text-lg">{emoji}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente para mostrar todas las reacciones de un mensaje
export function MessageReactionSummary({ 
  reactions, 
  currentUserId, 
  onReactionToggle 
}: Omit<MessageReactionsProps, 'messageId'> & { messageId?: string }) {
  const totalReactions = Object.values(reactions).reduce((sum, users) => sum + users.length, 0)
  
  if (totalReactions === 0) return null

  return (
    <div className="flex items-center gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, users]) => {
        if (users.length === 0) return null
        
        const hasReacted = users.includes(currentUserId)
        
        return (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => onReactionToggle && onReactionToggle('', emoji)}
            className={`h-5 px-1 py-0 text-xs rounded-full ${
              hasReacted 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span className="text-xs mr-1">{emoji}</span>
            <span className="text-xs">{users.length}</span>
          </Button>
        )
      })}
    </div>
  )
}
