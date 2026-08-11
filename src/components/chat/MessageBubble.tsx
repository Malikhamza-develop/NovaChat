import React, { useState } from 'react';
import { Message } from '../../types';
import { MessageStatus } from './MessageStatus';
import { Reply, Smile, Trash2, CornerUpLeft, Wifi, Smartphone, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioPlayer } from './AudioPlayer';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReply: (msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  onDelete: (msgId: string) => void;
}

const EMOJI_PICKER_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  onReply,
  onReact,
  onDelete,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderChannelBadge = () => {
    if (message.channel === 'wifi_direct') {
      return (
        <span
          title="Direct Wi-Fi P2P Transmission"
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium ${
            isMe
              ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <Wifi className="w-2.5 h-2.5" /> Direct P2P
        </span>
      );
    }
    if (message.channel === 'sim_sms') {
      return (
        <span
          title="SIM Cellular SMS Transmission"
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium ${
            isMe
              ? 'bg-amber-400/20 text-amber-100 border border-amber-300/30'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <Smartphone className="w-2.5 h-2.5" /> SIM SMS
        </span>
      );
    }
    return (
      <span
        title="NovaChat Cloud Sync"
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium ${
          isMe
            ? 'bg-blue-400/20 text-blue-100 border border-blue-300/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
        }`}
      >
        <Cloud className="w-2.5 h-2.5" /> Cloud
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`group relative flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'}`}
    >
      <div className="relative max-w-[82%] sm:max-w-[70%]">
        {/* Hover Action Menu */}
        <div
          className={`absolute top-0 -translate-y-full mb-1 z-10 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-md ${
            isMe ? 'right-0' : 'left-0'
          }`}
        >
          <button
            onClick={() => setShowPicker(!showPicker)}
            title="React"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Smile className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReply(message)}
            title="Reply"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Reply className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(message._id)}
            title="Delete"
            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Emoji Reaction Popover */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: -40 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className={`absolute top-0 z-20 flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1.5 shadow-xl ${
                isMe ? 'right-0' : 'left-0'
              }`}
            >
              {EMOJI_PICKER_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message._id, emoji);
                    setShowPicker(false);
                  }}
                  className="hover:scale-125 transition-transform text-lg"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Context Header */}
        {message.replyToMessage && (
          <div
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-t-xl border-l-2 mb-0.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 ${
              isMe ? 'border-blue-400 bg-blue-900/10' : 'border-indigo-500'
            }`}
          >
            <CornerUpLeft className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[200px]">
              {message.replyToMessage.content}
            </span>
          </div>
        )}

        {/* Main Message Container */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-xs transition-colors ${
            isMe
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
              : message.from === 'nova-ai' || message.isAi
              ? 'bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 text-slate-900 dark:text-slate-100 border border-indigo-200/80 dark:border-indigo-800/60 rounded-bl-xs shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs'
          }`}
        >
          {/* Nova AI Message Badge */}
          {(message.from === 'nova-ai' || message.isAi) && !isMe && (
            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-indigo-200/50 dark:border-indigo-800/40 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="p-0.5 bg-indigo-500 text-white rounded-md text-[10px]">✨</span>
              <span>Nova AI Assistant</span>
            </div>
          )}
          {/* Media Attachment if present */}
          {message.mediaUrl && (
            <div className="mb-2 overflow-hidden rounded-lg">
              <img
                src={message.mediaUrl}
                alt="Attachment"
                className="max-h-60 w-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Text or Audio Content */}
          {message.type === 'audio' ||
          message.audioUrl ||
          message.content?.includes('Voice message') ||
          message.content?.startsWith('🎙️') ? (
            <AudioPlayer
              audioUrl={message.audioUrl}
              duration={message.audioDuration || 5}
              isMe={isMe}
              content={message.content}
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Message Timestamp, Channel & Status */}
          <div
            className={`flex items-center justify-end gap-1.5 text-[11px] mt-1.5 ${
              isMe ? 'text-blue-100/80' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {renderChannelBadge()}
            <span>{formatTime(message.createdAt)}</span>
            {isMe && <MessageStatus status={message.status} />}
          </div>
        </div>

        {/* Active Reactions Pills */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`flex flex-wrap items-center gap-1 mt-1 ${
              isMe ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.reactions.map((r, idx) => (
              <span
                key={idx}
                onClick={() => onReact(message._id, r.emoji)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer hover:scale-105 transition-transform"
              >
                <span>{r.emoji}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
