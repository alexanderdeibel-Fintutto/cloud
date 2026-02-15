/**
 * Fintutto AI Chat Button
 * Floating Button zum Öffnen des AI Chats
 *
 * Kopiere diese Datei in deine Lovable App unter: src/components/ai/AIChatButton.tsx
 */

import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIChatButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  unreadCount?: number;
  variant?: 'default' | 'minimal';
}

export default function AIChatButton({
  onClick,
  isOpen = false,
  unreadCount = 0,
  variant = 'default'
}: AIChatButtonProps) {
  if (isOpen) return null;

  if (variant === 'minimal') {
    return (
      <Button
        onClick={onClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all z-50"
        aria-label="KI-Assistent öffnen"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="text-left pr-2">
          <div className="font-semibold text-sm">KI-Assistent</div>
          <div className="text-xs text-white/80">Fragen? Ich helfe!</div>
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
