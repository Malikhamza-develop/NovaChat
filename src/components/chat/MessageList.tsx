import React, { useRef, useEffect } from 'react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import { MessageSquare } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
  contactName?: string;
  onReply: (msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  onDelete: (msgId: string) => void;
  onRetryMessage?: (message: any) => void;
  onCopy?: (text: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isTyping,
  contactName,
  onReply,
  onReact,
  onDelete,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
          <MessageSquare className="w-8 h-8" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-300 text-base mb-1">
          No messages yet
        </p>
        <p className="text-xs max-w-xs text-slate-500 dark:text-slate-400">
          Send a greeting or share a photo to start the conversation on NovaChat!
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    msgs.forEach((m) => {
      let dateKey = 'Today';
      try {
        const d = new Date(m.createdAt);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
          dateKey = 'Today';
        } else {
          dateKey = d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      } catch {
        dateKey = 'Today';
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {Object.entries(grouped).map(([date, msgs]) => (
        <React.Fragment key={date}>
          <DateSeparator date={date} />
          {msgs.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isMe={msg.from === currentUserId || msg.from === 'user_current'}
              onReply={onReply}
              onReact={onReact}
              onDelete={onDelete}
            />
          ))}
        </React.Fragment>
      ))}

      {isTyping && <TypingIndicator name={contactName} />}
      <div ref={bottomRef} />
    </div>
  );
};
