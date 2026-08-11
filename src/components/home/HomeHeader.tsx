import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Sun, Moon, Plus, Archive, Settings, Sparkles } from 'lucide-react';

interface HomeHeaderProps {
  onOpenNewChat?: () => void;
  onOpenSettings?: () => void;
  onOpenOnboarding?: () => void;
  archivedCount?: number;
  showArchived?: boolean;
  onToggleShowArchived?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onArchivePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onOpenNewChat,
  onOpenSettings,
  onOpenOnboarding,
  archivedCount = 0,
  showArchived = false,
  onToggleShowArchived,
  onProfilePress,
  onNotificationPress,
  onArchivePress,
}) => {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight leading-none">
            NovaChat
          </h1>
          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
            Real-Time Sync
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenNewChat}
          title="New Chat"
          className="p-2 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleShowArchived}
          title="Archived Chats"
          className={`p-2 relative rounded-full transition-colors ${
            showArchived
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Archive className="w-5 h-5" />
          {archivedCount > 0 && !showArchived && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" />
          )}
        </button>

        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          title="Account & Settings"
          className="ml-1 focus:outline-none"
        >
          <Avatar
            src={user?.avatar}
            name={user?.name || 'User'}
            size="sm"
            verified={user?.verified}
          />
        </button>
      </div>
    </div>
  );
};
