import React, { useState, useEffect } from 'react';
import { X, UserPlus, Sparkles, Search, User as UserIcon, CheckCircle2, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { searchUsers } from '../../services/api/userApi';
import { User } from '../../types/Auth';

interface NewChatModalProps {
  onClose: () => void;
  onCreate: (name: string, email: string, userId?: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onCreate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Manual fallback form state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const users = await searchUsers(searchQuery);
        if (isMounted) {
          setRegisteredUsers(users);
        }
      } catch (err) {
        console.warn('Failed to search registered users:', err);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    const timer = setTimeout(fetchUsers, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSelectUser = (user: User) => {
    onCreate(user.name, user.email, user._id);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    onCreate(
      manualName.trim(),
      manualEmail.trim() || `${manualName.toLowerCase().replace(/\s+/g, '')}@novachat.app`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                Start New Chat
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Find registered NovaChat users or add a custom contact
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Bar for Registered Users */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Search Registered Users (e.g. Hamza, test account)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
            />
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto min-h-[160px] space-y-2 pr-1 mb-4">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {loadingUsers ? 'Searching...' : 'Registered Users on Platform'}
          </span>

          {registeredUsers.length > 0 ? (
            registeredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between cursor-pointer transition-all hover:border-indigo-300 dark:hover:border-indigo-700 group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        u.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    {u.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {u.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.isOnline && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  )}
                  <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              {loadingUsers
                ? 'Searching users...'
                : searchQuery
                ? 'No registered user matches your query. You can add them manually below.'
                : 'No other registered users found online yet.'}
            </div>
          )}
        </div>

        {/* Manual Fallback Contact Add */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Or Add Custom / P2P Contact
          </span>
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Contact Name"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs"
              />
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="Email (Optional)"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={!manualName.trim()}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all disabled:opacity-40"
            >
              Add Custom Contact
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
