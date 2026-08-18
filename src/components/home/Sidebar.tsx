import React from 'react';
import { useChat } from '../../context/ChatContext';
import { HomeHeader } from './HomeHeader';
import { ConversationCard } from './ConversationCard';
import { Search, SlidersHorizontal, MessageSquarePlus, Sparkles } from 'lucide-react';

interface SidebarProps {
  onOpenNewChat: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewChat,
  onOpenSettings,
  onOpenOnboarding,
  className = '',
}) => {
  const {
    conversations,
    activeChatId,
    setActiveChatId,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    togglePinConversation,
    toggleArchiveConversation,
    toggleMuteConversation,
    deleteConversation,
  } = useChat();

  const archivedCount = conversations.filter((c) => c.archived).length;

  const filteredConversations = conversations
    .filter((c) => {
      // Filter by archive state
      if (activeFilter === 'archived') return c.archived;
      if (c.archived) return false; // Hide archived from normal lists

      // Filter by category
      if (activeFilter === 'unread' && c.unreadCount === 0) return false;
      if (activeFilter === 'pinned' && !c.pinned) return false;

      // Filter by search term
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.lastMessage.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Pinned items stay on top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
    });

  return (
    <div
      className={`flex flex-col bg-slate-50 dark:bg-slate-900/95 border-r border-slate-200/80 dark:border-slate-800 ${className}`}
    >
      <HomeHeader
        onOpenNewChat={onOpenNewChat}
        onOpenSettings={onOpenSettings}
        onOpenOnboarding={onOpenOnboarding}
        archivedCount={archivedCount}
        showArchived={activeFilter === 'archived'}
        onToggleShowArchived={() =>
          setActiveFilter(activeFilter === 'archived' ? 'all' : 'archived')
        }
      />

      {/* Search Bar & Filter Tabs */}
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages or contacts..."
            className="w-full bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-xs overflow-x-auto no-scrollbar py-0.5 gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            All Chats
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'unread'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setActiveFilter('pinned')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'pinned'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveFilter('archived')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'archived'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((c) => (
            <ConversationCard
              key={c.userId}
              conversation={c}
              isActive={activeChatId === c.userId}
              onClick={() => setActiveChatId(c.userId)}
              onPin={() => togglePinConversation(c.userId)}
              onArchive={() => toggleArchiveConversation(c.userId)}
              onMute={() => toggleMuteConversation(c.userId)}
              onDelete={() => deleteConversation(c.userId)}
            />
          ))
        ) : (
          <div className="py-12 px-4 text-center text-slate-400 dark:text-slate-500">
            <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No conversations found
            </p>
            <p className="text-xs mt-1">
              Try modifying your search query or start a new thread.
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Bar at bottom of sidebar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={onOpenOnboarding}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          <Sparkles className="w-4 h-4" /> Feature Highlights
        </button>

        <button
          onClick={onOpenNewChat}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>
    </div>
  );
};
