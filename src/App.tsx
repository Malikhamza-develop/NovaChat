import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useChat } from './context/ChatContext';
import { Sidebar } from './components/home/Sidebar';
import { ChatHeader } from './components/chat/ChatHeader';
import { MessageList } from './components/chat/MessageList';
import { MessageInput } from './components/chat/MessageInput';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { NewChatModal } from './components/modals/NewChatModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { AuthModal } from './components/modals/AuthModal';
import { AiToolsModal } from './components/chat/AiToolsModal';
import { CallModal } from './components/modals/CallModal';
import { IncomingCallModal } from './components/modals/IncomingCallModal';
import { PermissionModal, PermissionType } from './components/modals/PermissionModal';
import { MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { MessageChannel } from './types';

export default function App() {
  const { user, showAuthModal, closeAuthModal } = useAuth();
  const {
    conversations,
    activeChatId,
    setActiveChatId,
    messages,
    sendMessage,
    replyingTo,
    setReplyingTo,
    addReaction,
    deleteMessage,
    togglePinConversation,
    toggleArchiveConversation,
    toggleMuteConversation,
    deleteConversation,
    typingUsers,
    startNewChat,
    selectedChannel,
    activeSim,
    simCarrier,
    incomingCall,
    activeCall,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
  } = useChat();

  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAiTools, setShowAiTools] = useState(false);
  const [insertedText, setInsertedText] = useState('');

  // Permission Modal state
  const [permissionModal, setPermissionModal] = useState<{
    isOpen: boolean;
    requiredPermission?: PermissionType;
  }>({ isOpen: false });

  const activeConversation = conversations.find((c) => c.userId === activeChatId);
  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];
  const isTyping = activeChatId ? !!typingUsers[activeChatId] : false;

  const handleStartAudioCall = async () => {
    if (!activeConversation) return;
    try {
      if (selectedChannel !== 'sim_sms' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
      initiateCall(activeConversation.userId, 'audio', selectedChannel);
    } catch {
      setPermissionModal({
        isOpen: true,
        requiredPermission: 'microphone',
      });
    }
  };

  const handleStartVideoCall = async () => {
    if (!activeConversation) return;
    const channelToUse = selectedChannel === 'sim_sms' ? 'cloud' : selectedChannel;
    if (selectedChannel === 'sim_sms') {
      alert('SIM Cellular voice calls do not support video. Switching to Cloud Data video call.');
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
      initiateCall(activeConversation.userId, 'video', channelToUse);
    } catch {
      setPermissionModal({
        isOpen: true,
        requiredPermission: 'camera',
      });
    }
  };

  const handleCallEnded = (durationSecs: number, channelUsed: MessageChannel, callType: 'audio' | 'video') => {
    if (!activeConversation) return;
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    const durationStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const channelLabel =
      channelUsed === 'wifi_direct'
        ? 'Wi-Fi Direct'
        : channelUsed === 'sim_sms'
        ? `${activeSim} Cellular`
        : 'Cloud Data';

    const icon = callType === 'video' ? '📹' : '📞';
    const logContent = `${icon} ${callType === 'video' ? 'Video' : 'Voice'} call (${durationStr}) via ${channelLabel}`;

    sendMessage(logContent, 'text', undefined, undefined, undefined, channelUsed);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FF] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        onOpenNewChat={() => setShowNewChat(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 transition-all ${
          activeChatId ? 'hidden md:flex' : 'flex'
        }`}
      />

      {/* Main Chat Conversation View */}
      <div
        className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative ${
          !activeChatId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Active Thread Header */}
            <ChatHeader
              conversation={activeConversation}
              isTyping={isTyping}
              onBack={() => setActiveChatId(null)}
              onOpenProfile={() => setShowUserProfile(true)}
              onOpenAiTools={() => setShowAiTools(true)}
              onTogglePin={() => togglePinConversation(activeConversation.userId)}
              onToggleArchive={() => toggleArchiveConversation(activeConversation.userId)}
              onToggleMute={() => toggleMuteConversation(activeConversation.userId)}
              onStartAudioCall={handleStartAudioCall}
              onStartVideoCall={handleStartVideoCall}
            />

            {/* Scrollable Message Bubbles */}
            <MessageList
              messages={activeMessages}
              currentUserId={user?._id || 'user_current'}
              isTyping={isTyping}
              contactName={activeConversation.name}
              onReply={(msg) => setReplyingTo(msg)}
              onReact={(msgId, emoji) => addReaction(msgId, emoji)}
              onDelete={(msgId) => deleteMessage(msgId)}
            />

            {/* Interactive Message Input Box */}
            <MessageInput
              onSendMessage={sendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              insertedText={insertedText}
              onRequestPermission={(type) =>
                setPermissionModal({ isOpen: true, requiredPermission: type })
              }
            />
          </>
        ) : (
          /* Empty Chat Selection State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-10 h-10 fill-white/20" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Welcome to NovaChat
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
              Select a conversation from the left drawer or start a new chat thread to begin messaging in real time.
            </p>

            <button
              onClick={() => setShowNewChat(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Start Conversation
            </button>
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      {showUserProfile && activeConversation && (
        <UserProfileModal
          conversation={activeConversation}
          onClose={() => setShowUserProfile(false)}
          onTogglePin={() => togglePinConversation(activeConversation.userId)}
          onToggleArchive={() => toggleArchiveConversation(activeConversation.userId)}
          onToggleMute={() => toggleMuteConversation(activeConversation.userId)}
          onDelete={() => {
            deleteConversation(activeConversation.userId);
            setShowUserProfile(false);
          }}
          onStartAudioCall={() => {
            setShowUserProfile(false);
            handleStartAudioCall();
          }}
          onStartVideoCall={() => {
            setShowUserProfile(false);
            handleStartVideoCall();
          }}
        />
      )}

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreate={(name, email, userId) => {
            startNewChat(name, email, undefined, userId);
          }}
        />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      {showAiTools && (
        <AiToolsModal
          isOpen={showAiTools}
          onClose={() => setShowAiTools(false)}
          conversation={activeConversation}
          messages={activeMessages}
          onInsertText={(text) => {
            setInsertedText(text);
            setShowAiTools(false);
          }}
        />
      )}

      {activeCall && (
        <CallModal
          isOpen={true}
          onClose={() => endCall()}
          contactName={activeCall.contactName}
          contactAvatar={activeCall.contactAvatar}
          contactUserId={activeCall.contactUserId}
          type={activeCall.callType}
          initialChannel={activeCall.channel}
          simCarrier={simCarrier}
          activeSim={activeSim}
          onCallEnded={(durationSecs) => endCall(durationSecs)}
        />
      )}

      {incomingCall && (
        <IncomingCallModal
          isOpen={true}
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          channel={incomingCall.channel}
          simSlot={activeSim}
          onDecline={() => declineCall()}
          onAccept={() => acceptCall()}
        />
      )}

      <PermissionModal
        isOpen={permissionModal.isOpen}
        onClose={() => setPermissionModal({ isOpen: false })}
        requiredPermission={permissionModal.requiredPermission}
        onPermissionGranted={(type) => {
          if (type === 'microphone' && activeConversation) {
            initiateCall(activeConversation.userId, 'audio', selectedChannel);
          } else if (type === 'camera' && activeConversation) {
            initiateCall(activeConversation.userId, 'video', selectedChannel === 'sim_sms' ? 'cloud' : selectedChannel);
          }
          setPermissionModal({ isOpen: false });
        }}
      />

      {(showAuthModal || !user) && (
        <AuthModal
          onClose={closeAuthModal}
          canDismiss={!!user}
        />
      )}
    </div>
  );
}
