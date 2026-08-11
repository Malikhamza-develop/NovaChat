import React from 'react';
import { ConversationSummary } from '../../types';
import { Avatar } from '../common/Avatar';
import {
  X,
  Phone,
  Video,
  Pin,
  VolumeX,
  Archive,
  Trash2,
  Mail,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserProfileModalProps {
  conversation: ConversationSummary;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onToggleMute: () => void;
  onDelete: () => void;
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  conversation,
  onClose,
  onTogglePin,
  onToggleArchive,
  onToggleMute,
  onDelete,
  onStartAudioCall,
  onStartVideoCall,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="relative h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 p-4 flex items-start justify-between">
          <span className="text-white/80 text-xs font-semibold tracking-wider uppercase">
            Contact Info
          </span>
          <button
            onClick={onClose}
            className="p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 pb-6 relative -mt-12 text-center">
          <div className="inline-block relative mb-3">
            <Avatar
              src={conversation.avatar}
              name={conversation.name}
              size="xl"
              online={conversation.online}
              verified={conversation.verified}
              className="ring-4 ring-white dark:ring-slate-900 shadow-lg"
            />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
            {conversation.name}
            {conversation.verified && (
              <ShieldCheck className="w-5 h-5 text-sky-500" />
            )}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {conversation.online ? (
              <span className="text-emerald-500 font-medium">Active Now</span>
            ) : (
              `Last seen ${conversation.lastSeen || 'recently'}`
            )}
          </p>

          {/* Action Quick Buttons */}
          <div className="flex items-center justify-center gap-4 my-5">
            <button
              onClick={onStartAudioCall || (() => alert(`Calling ${conversation.name}...`))}
              className="flex flex-col items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              Audio
            </button>

            <button
              onClick={onStartVideoCall || (() => alert(`Video calling ${conversation.name}...`))}
              className="flex flex-col items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Video className="w-5 h-5" />
              </div>
              Video
            </button>

            <button
              onClick={onToggleMute}
              className="flex flex-col items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <VolumeX className="w-5 h-5" />
              </div>
              {conversation.muted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          {/* Contact Details List */}
          <div className="space-y-3 text-left bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span className="truncate">{conversation.name.toLowerCase().replace(' ', '.')}@novachat.app</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              <span>Shared Media: 12 photos & files</span>
            </div>
          </div>

          {/* Danger & Action Controls */}
          <div className="mt-5 space-y-2 text-sm font-medium">
            <button
              onClick={onTogglePin}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Pin className="w-4 h-4 text-amber-500" />
              {conversation.pinned ? 'Unpin Chat' : 'Pin Chat'}
            </button>

            <button
              onClick={onToggleArchive}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Archive className="w-4 h-4 text-indigo-500" />
              {conversation.archived ? 'Unarchive Chat' : 'Archive Chat'}
            </button>

            <button
              onClick={onDelete}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Conversation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
