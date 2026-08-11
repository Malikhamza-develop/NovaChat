import React from 'react';
import { ConversationSummary, MessageChannel } from '../../types';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { Phone, Video, Info, MoreVertical, ArrowLeft, Archive, Pin, VolumeX, Wifi, Smartphone, Cloud, Radio, Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  conversation?: ConversationSummary;
  name?: string;
  image?: string;
  online?: boolean;
  typing?: boolean;
  lastSeen?: string;
  isTyping?: boolean;
  onBack?: () => void;
  onProfilePress?: () => void;
  onMorePress?: () => void;
  onOpenProfile?: () => void;
  onOpenAiTools?: () => void;
  onTogglePin?: () => void;
  onToggleArchive?: () => void;
  onToggleMute?: () => void;
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  name,
  image,
  online,
  typing,
  lastSeen,
  isTyping,
  onBack,
  onProfilePress,
  onMorePress,
  onOpenProfile,
  onOpenAiTools,
  onTogglePin = () => {},
  onToggleArchive = () => {},
  onToggleMute = () => {},
  onStartAudioCall,
  onStartVideoCall,
}) => {
  const effectiveConversation: ConversationSummary = conversation || {
    userId: 'user_1',
    name: name || 'Contact',
    avatar: image || '',
    unreadCount: 0,
    lastMessage: '',
    lastAt: new Date().toISOString(),
    online: online ?? false,
    verified: false,
    pinned: false,
    archived: false,
    muted: false,
  };
  const effectiveOpenProfile = onOpenProfile || onProfilePress || (() => {});
  const effectiveIsTyping = isTyping ?? typing;

  const {
    selectedChannel,
    setSelectedChannel,
    connectWifiDirectPeer,
    disconnectWifiDirectPeer,
    activeSim,
    simCarrier,
  } = useChat();

  const isWifiConnected = conversation.wifiDirectStatus === 'connected';

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 z-10 shadow-2xs flex-shrink-0">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={onOpenProfile}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Avatar
              src={conversation.avatar}
              name={conversation.name}
              online={conversation.online}
              verified={conversation.verified}
              size="md"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {conversation.name}
                </h2>
                {conversation.pinned && (
                  <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                )}
                {conversation.muted && (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTyping ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    typing...
                  </span>
                ) : conversation.online ? (
                  <span className="text-emerald-500 font-medium">Active now</span>
                ) : (
                  `Last seen ${conversation.lastSeen || 'recently'}`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Channel Selector Pills & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Transport Switcher Pills */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setSelectedChannel('wifi_direct')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedChannel === 'wifi_direct'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Direct Wi-Fi Peer-to-Peer Channel"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Wi-Fi Direct</span>
            </button>

            <button
              onClick={() => setSelectedChannel('sim_sms')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedChannel === 'sim_sms'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="SIM Cellular SMS Fallback Channel"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SIM SMS</span>
            </button>

            <button
              onClick={() => setSelectedChannel('cloud')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedChannel === 'cloud'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Cloud Internet Synchronization"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud</span>
            </button>
          </div>

          {/* AI Smart Tools Trigger Button */}
          {onOpenAiTools && (
            <button
              onClick={onOpenAiTools}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all hover:scale-105 active:scale-95"
              title="Nova AI Smart Suite (Summarize, Reply, Tone, Translate)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Tools</span>
            </button>
          )}

          <button
            onClick={onStartAudioCall || (() => alert(`Starting audio call with ${conversation.name}...`))}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Voice Call"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onStartVideoCall || (() => alert(`Starting video call with ${conversation.name}...`))}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Video Call"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="relative group">
            <button
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30">
              <button
                onClick={onOpenProfile}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-slate-400" /> View Contact Info
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Transport Channel
              </div>
              <button
                onClick={() => setSelectedChannel('wifi_direct')}
                className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 ${
                  selectedChannel === 'wifi_direct'
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <Wifi className="w-4 h-4" /> Switch to Direct Wi-Fi P2P
              </button>
              <button
                onClick={() => setSelectedChannel('sim_sms')}
                className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 ${
                  selectedChannel === 'sim_sms'
                    ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Switch to SIM Cellular SMS
              </button>
              <button
                onClick={() => setSelectedChannel('cloud')}
                className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 ${
                  selectedChannel === 'cloud'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <Cloud className="w-4 h-4" /> Switch to Cloud Internet
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />
              <button
                onClick={onTogglePin}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <Pin className="w-4 h-4 text-slate-400" />
                {conversation.pinned ? 'Unpin Conversation' : 'Pin Conversation'}
              </button>
              <button
                onClick={onToggleMute}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <VolumeX className="w-4 h-4 text-slate-400" />
                {conversation.muted ? 'Unmute Notifications' : 'Mute Notifications'}
              </button>
              <button
                onClick={onToggleArchive}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <Archive className="w-4 h-4 text-slate-400" />
                {conversation.archived ? 'Unarchive Chat' : 'Archive Chat'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header Banner detailing active transport channel */}
      {selectedChannel === 'wifi_direct' && (
        <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border-t border-emerald-200/60 dark:border-emerald-900/40 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isWifiConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isWifiConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">Wi-Fi Direct P2P:</span>
            <span>
              {isWifiConnected
                ? `Connected to ${conversation.name} (${conversation.wifiDirectSignal || 90}% signal)`
                : 'Peer device ready for direct pairing'}
            </span>
          </div>

          <button
            onClick={() => {
              if (isWifiConnected) {
                disconnectWifiDirectPeer(conversation.userId);
              } else {
                connectWifiDirectPeer(conversation.userId);
              }
            }}
            className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-semibold transition-colors"
          >
            {isWifiConnected ? 'Disconnect P2P' : 'Pair Device'}
          </button>
        </div>
      )}

      {selectedChannel === 'sim_sms' && (
        <div className="bg-amber-500/10 dark:bg-amber-950/30 border-t border-amber-200/60 dark:border-amber-900/40 px-4 py-1.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span className="font-semibold">SIM Cellular SMS:</span>
            <span>
              Using {activeSim} ({simCarrier}) &bull; Target Mobile: {conversation.phoneNumber || '+1 (555) 019-2834'}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
            SMS Fallback Active
          </span>
        </div>
      )}
    </div>
  );
};
