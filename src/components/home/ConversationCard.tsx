import React, { useState } from 'react';
import { ConversationSummary } from '../../types';
import { Avatar } from '../common/Avatar';
import { MessageStatus } from '../chat/MessageStatus';
import { Pin, VolumeX, Archive, Trash2, MoreHorizontal, Wifi, Smartphone, Cloud } from 'lucide-react';

interface ConversationCardProps {
  conversation: ConversationSummary;
  isActive?: boolean;
  onClick?: () => void;
  onPress?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isActive = false,
  onClick,
  onPress,
  onPin,
  onArchive,
  onMute,
  onDelete,
}) => {
  const handleCardClick = onClick || onPress || (() => {});

  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
        isActive
          ? 'bg-indigo-50/90 dark:bg-slate-800/90 border border-indigo-200/60 dark:border-slate-700 shadow-2xs'
          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 border border-transparent'
      }`}
    >
      <Avatar
        src={conversation.avatar}
        name={conversation.name}
        online={conversation.online}
        verified={conversation.verified}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`font-semibold text-sm truncate ${
                isActive
                  ? 'text-indigo-950 dark:text-indigo-200'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {conversation.name}
            </h3>
            {(conversation.userId === 'nova-ai' || conversation.isAi) && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-white shadow-2xs">
                ✨ AI
              </span>
            )}
            {conversation.pinned && (
              <Pin className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
            {conversation.muted && (
              <VolumeX className="w-3 h-3 text-slate-400 flex-shrink-0" />
            )}
            {conversation.preferredChannel === 'wifi_direct' && (
              <span title="Wi-Fi Direct P2P Enabled" className="p-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Wifi className="w-3 h-3" />
              </span>
            )}
            {conversation.preferredChannel === 'sim_sms' && (
              <span title="SIM Cellular SMS Channel" className="p-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Smartphone className="w-3 h-3" />
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-medium flex-shrink-0 ${
              conversation.unreadCount > 0
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {formatTime(conversation.lastAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className={`text-xs truncate pr-2 ${
              conversation.typing
                ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                : conversation.unreadCount > 0
                ? 'text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {conversation.typing ? (
              'typing...'
            ) : (
              <>
                {conversation.status && (
                  <span className="inline-block mr-1 align-middle">
                    <MessageStatus status={conversation.status} />
                  </span>
                )}
                {conversation.lastMessage}
              </>
            )}
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {conversation.unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs animate-pulse-slow">
                {conversation.unreadCount}
              </span>
            )}

            {/* Quick Action Trigger Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickMenu(!showQuickMenu);
              }}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Menu Popover */}
      {showQuickMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2 top-full mt-1 z-30 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
        >
          <button
            onClick={() => {
              onPin();
              setShowQuickMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Pin className="w-3.5 h-3.5" />
            {conversation.pinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={() => {
              onMute();
              setShowQuickMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <VolumeX className="w-3.5 h-3.5" />
            {conversation.muted ? 'Unmute' : 'Mute'}
          </button>
          <button
            onClick={() => {
              onArchive();
              setShowQuickMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Archive className="w-3.5 h-3.5" />
            {conversation.archived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            onClick={() => {
              onDelete();
              setShowQuickMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
