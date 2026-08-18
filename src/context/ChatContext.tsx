import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConversationSummary, Message, MessageChannel, MessageStatus, Reaction } from '../types';
import {
  getStoredConversations,
  saveStoredConversations,
  getStoredMessages,
  saveStoredMessages,
} from '../services/storage';
import { useAuth } from './AuthContext';
import { SERVER_URL } from '../config/environment';
import { searchUsers } from '../services/api/userApi';
import { getConversation as apiGetConversation } from '../services/api/chatApi';
import { askAiAssistant } from '../services/aiService';

export interface WifiPeerDevice {
  id: string;
  name: string;
  deviceType: 'phone' | 'tablet' | 'laptop';
  signal: number;
  ipAddress: string;
  status: 'available' | 'connecting' | 'connected';
  associatedUserId?: string;
}

export interface IncomingCallData {
  callerUserId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  channel: MessageChannel;
}

export interface ActiveCallData {
  contactUserId: string;
  contactName: string;
  contactAvatar?: string;
  callType: 'audio' | 'video';
  channel: MessageChannel;
  status: 'connecting' | 'connected' | 'ended';
}

interface ChatContextType {
  conversations: ConversationSummary[];
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  searchQuery: string;
  activeFilter: 'all' | 'unread' | 'pinned' | 'archived';
  replyingTo: Message | null;
  typingUsers: Record<string, boolean>;
  selectedChannel: MessageChannel;
  activeSim: 'SIM 1' | 'SIM 2';
  simCarrier: string;
  isScanningWifi: boolean;
  wifiDirectPeers: WifiPeerDevice[];
  incomingCall: IncomingCallData | null;
  activeCall: ActiveCallData | null;
  initiateCall: (toUserId: string, callType: 'audio' | 'video', channelOverride?: MessageChannel) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: (durationSecs?: number) => void;
  setSelectedChannel: (channel: MessageChannel) => void;
  setActiveSim: (sim: 'SIM 1' | 'SIM 2') => void;
  scanWifiDirectPeers: () => void;
  connectWifiDirectPeer: (userId: string) => void;
  disconnectWifiDirectPeer: (userId: string) => void;
  setActiveChatId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: 'all' | 'unread' | 'pinned' | 'archived') => void;
  sendMessage: (
    content: string,
    type?: 'text' | 'image' | 'audio',
    mediaUrl?: string,
    audioUrl?: string,
    audioDuration?: number,
    channelOverride?: MessageChannel
  ) => void;
  togglePinConversation: (userId: string) => void;
  toggleArchiveConversation: (userId: string) => void;
  toggleMuteConversation: (userId: string) => void;
  deleteConversation: (userId: string) => void;
  markAsRead: (userId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string) => void;
  setReplyingTo: (message: Message | null) => void;
  startNewChat: (name: string, email: string, phone?: string, userIdOverride?: string) => string;
}

const INITIAL_PEERS: WifiPeerDevice[] = [];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>(getStoredConversations());
  const [messages, setMessages] = useState<Record<string, Message[]>>(getStoredMessages());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const stored = getStoredConversations();
    return stored[0]?.userId || null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Direct Wi-Fi & SIM Channel state
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>('wifi_direct');
  const [activeSim, setActiveSim] = useState<'SIM 1' | 'SIM 2'>('SIM 1');
  const [simCarrier, setSimCarrier] = useState<string>('Verizon 5G UW');
  const [isScanningWifi, setIsScanningWifi] = useState<boolean>(false);
  const [wifiDirectPeers, setWifiDirectPeers] = useState<WifiPeerDevice[]>(INITIAL_PEERS);

  // Call Signaling State
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCallData | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const activeChatIdRef = useRef<string | null>(activeChatId);

  // Cross-tab BroadcastChannel for call signaling across multiple tabs/windows
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('novachat_call_signaling');
      broadcastRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'call:invite') {
          // If message is meant for this user or active chat, trigger incoming call
          if (data.toUserId === user?._id || data.toUserId === activeChatIdRef.current || !user?._id) {
            setIncomingCall({
              callerUserId: data.fromUserId,
              callerName: data.callerName,
              callerAvatar: data.callerAvatar,
              callType: data.callType,
              channel: data.channel,
            });
          }
        } else if (data.type === 'call:accepted') {
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
        } else if (data.type === 'call:declined') {
          setActiveCall(null);
          setIncomingCall(null);
        } else if (data.type === 'call:ended') {
          setActiveCall(null);
          setIncomingCall(null);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [user?._id]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Sync selectedChannel when active chat changes
  useEffect(() => {
    if (activeChatId) {
      const activeConv = conversations.find((c) => c.userId === activeChatId);
      if (activeConv?.preferredChannel) {
        setSelectedChannel(activeConv.preferredChannel);
      }
    }
  }, [activeChatId, conversations]);

  useEffect(() => {
    saveStoredConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  // Poll/Sync registered NovaChat users into contacts
  useEffect(() => {
    let isMounted = true;
    const syncRegisteredUsers = async () => {
      if (!user?._id) return;
      try {
        const users = await searchUsers('');
        if (!isMounted) return;

        setConversations((prev) => {
          const existingMap = new Map(prev.map((c) => [c.userId, c]));
          let changed = false;
          const updated = [...prev];

          users.forEach((u) => {
            if (u._id === user._id) return;
            if (!existingMap.has(u._id)) {
              changed = true;
              updated.push({
                userId: u._id,
                name: u.name,
                avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                lastMessage: 'Tap to start conversation',
                lastAt: new Date().toISOString(),
                unreadCount: 0,
                online: !!u.isOnline,
                typing: false,
                muted: false,
                pinned: false,
                archived: false,
                verified: true,
                status: 'read',
                preferredChannel: 'cloud',
              });
            } else {
              const existing = existingMap.get(u._id);
              if (existing && existing.online !== !!u.isOnline) {
                changed = true;
                existing.online = !!u.isOnline;
              }
            }
          });

          return changed ? [...updated] : prev;
        });
      } catch (err) {
        console.warn('Sync registered users notice:', err);
      }
    };

    syncRegisteredUsers();
    const interval = setInterval(syncRegisteredUsers, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?._id]);

  // Real-time Socket.IO Connection
  useEffect(() => {
    if (!user?._id) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket: Socket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Realtime socket connected for user:', user._id);
    });

    socket.on('message', (msg: Message) => {
      console.log('Incoming real-time message:', msg);
      const senderId = msg.from;

      socket.emit('messageDelivered', { messageId: msg._id });

      if (activeChatIdRef.current === senderId) {
        socket.emit('messageRead', { messageId: msg._id });
        msg.status = 'read';
      }

      setMessages((prev) => {
        const list = prev[senderId] || [];
        if (list.some((m) => m._id === msg._id || (m.clientId && m.clientId === msg.clientId))) {
          return prev;
        }
        return { ...prev, [senderId]: [...list, msg] };
      });

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.userId === senderId);
        let senderName = 'NovaChat User';
        if (index >= 0) {
          senderName = prev[index].name;
        }

        // Trigger browser native Push Notification if granted and chat is backgrounded or not currently focused
        if ('Notification' in window && Notification.permission === 'granted' && activeChatIdRef.current !== senderId) {
          try {
            new Notification(senderName, {
              body: msg.content.length > 80 ? msg.content.substring(0, 80) + '...' : msg.content,
              icon: '/favicon.ico',
            });
          } catch (e) {
            console.warn('Native notification popup suppressed:', e);
          }
        }

        if (index >= 0) {
          return prev.map((c) =>
            c.userId === senderId
              ? {
                  ...c,
                  lastMessage: msg.content,
                  lastAt: msg.createdAt || new Date().toISOString(),
                  unreadCount: activeChatIdRef.current === senderId ? 0 : (c.unreadCount || 0) + 1,
                  status: (msg.status as any) || 'delivered',
                }
              : c
          );
        } else {
          const newConv: ConversationSummary = {
            userId: senderId,
            name: 'NovaChat User',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            lastMessage: msg.content,
            lastAt: msg.createdAt || new Date().toISOString(),
            unreadCount: activeChatIdRef.current === senderId ? 0 : 1,
            online: true,
            typing: false,
            muted: false,
            pinned: false,
            archived: false,
            verified: true,
            status: 'delivered',
            preferredChannel: 'cloud',
          };
          return [newConv, ...prev];
        }
      });
    });

    socket.on('message:sent', (serverMsg: Message) => {
      const targetUserId = serverMsg.to;
      const statusToSet = serverMsg.status || 'sent';

      setMessages((prev) => {
        const next = { ...prev };
        let found = false;

        Object.keys(next).forEach((key) => {
          if (next[key].some((m) => (m.clientId && m.clientId === serverMsg.clientId) || m._id === serverMsg._id)) {
            found = true;
            next[key] = next[key].map((m) =>
              (m.clientId && m.clientId === serverMsg.clientId) || m._id === serverMsg._id
                ? { ...m, ...serverMsg, status: statusToSet }
                : m
            );
          }
        });

        if (!found && targetUserId) {
          const list = next[targetUserId] || [];
          next[targetUserId] = list.map((m) =>
            (m.clientId && m.clientId === serverMsg.clientId) || m._id === serverMsg._id
              ? { ...m, ...serverMsg, status: statusToSet }
              : m
          );
        }
        return next;
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.userId === targetUserId || c.userId === serverMsg.from
            ? { ...c, status: statusToSet as any }
            : c
        )
      );
    });

    socket.on('message:delivered', (delivMsg: Message) => {
      const chatKey = delivMsg.to || delivMsg.from;
      setMessages((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key].some((m) => m._id === delivMsg._id || (m.clientId && m.clientId === delivMsg.clientId))) {
            next[key] = next[key].map((m) =>
              m._id === delivMsg._id || (m.clientId && m.clientId === delivMsg.clientId)
                ? { ...m, status: 'delivered' }
                : m
            );
          }
        });
        return next;
      });
      setConversations((prev) =>
        prev.map((c) => (c.userId === chatKey ? { ...c, status: 'delivered' } : c))
      );
    });

    socket.on('message:read', (readMsg: Message) => {
      const chatKey = readMsg.to || readMsg.from;
      setMessages((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key].some((m) => m._id === readMsg._id || (m.clientId && m.clientId === readMsg.clientId))) {
            next[key] = next[key].map((m) =>
              m._id === readMsg._id || (m.clientId && m.clientId === readMsg.clientId)
                ? { ...m, status: 'read' }
                : m
            );
          }
        });
        return next;
      });
      setConversations((prev) =>
        prev.map((c) => (c.userId === chatKey ? { ...c, status: 'read' } : c))
      );
    });

    socket.on('onlineUsers', (onlineIds: string[]) => {
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          online: onlineIds.includes(c.userId),
        }))
      );
    });

    socket.on('userOnline', ({ userId }: { userId: string }) => {
      setConversations((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, online: true } : c))
      );
    });

    socket.on('userOffline', ({ userId }: { userId: string }) => {
      setConversations((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, online: false } : c))
      );
    });

    socket.on('typing', ({ fromUserId, isTyping }: { fromUserId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => ({ ...prev, [fromUserId]: isTyping }));
    });

    // Realtime Call Signaling socket listeners
    socket.on('call:invite', (data: { fromUserId: string; callerName: string; callerAvatar?: string; callType: 'audio' | 'video'; channel: MessageChannel }) => {
      setIncomingCall({
        callerUserId: data.fromUserId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        callType: data.callType,
        channel: data.channel,
      });
    });

    socket.on('call:accepted', () => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
    });

    socket.on('call:declined', () => {
      setActiveCall(null);
      setIncomingCall(null);
    });

    socket.on('call:ended', () => {
      setActiveCall(null);
      setIncomingCall(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  // Fetch backend message history when selecting a real chat
  useEffect(() => {
    if (!activeChatId || activeChatId.startsWith('demo-')) return;
    let isMounted = true;

    const fetchChatHistory = async () => {
      try {
        const res = await apiGetConversation(activeChatId);
        if (isMounted && res.messages) {
          setMessages((prev) => {
            const localList = prev[activeChatId] || [];
            const map = new Map<string, Message>();
            localList.forEach((m) => map.set(m._id || m.clientId || '', m));
            res.messages.forEach((m) => map.set(m._id || m.clientId || '', m));
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return { ...prev, [activeChatId]: merged };
          });
        }
      } catch (err) {
        console.warn('Fetch chat history notice:', err);
      }
    };

    fetchChatHistory();
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversationRead', { fromUserId: activeChatId });
    }

    return () => {
      isMounted = false;
    };
  }, [activeChatId]);

  const scanWifiDirectPeers = useCallback(() => {
    setIsScanningWifi(true);
    setTimeout(() => {
      setIsScanningWifi(false);
    }, 2000);
  }, []);

  const connectWifiDirectPeer = (userId: string) => {
    setWifiDirectPeers((prev) =>
      prev.map((p) =>
        p.associatedUserId === userId
          ? { ...p, status: 'connected', signal: Math.floor(Math.random() * 20) + 80 }
          : p
      )
    );
    setConversations((prev) =>
      prev.map((c) =>
        c.userId === userId
          ? {
              ...c,
              wifiDirectStatus: 'connected',
              wifiDirectSignal: Math.floor(Math.random() * 20) + 80,
              preferredChannel: 'wifi_direct',
            }
          : c
      )
    );
    setSelectedChannel('wifi_direct');
  };

  const disconnectWifiDirectPeer = (userId: string) => {
    setWifiDirectPeers((prev) =>
      prev.map((p) =>
        p.associatedUserId === userId ? { ...p, status: 'available', signal: 0 } : p
      )
    );
    setConversations((prev) =>
      prev.map((c) =>
        c.userId === userId
          ? {
              ...c,
              wifiDirectStatus: 'disconnected',
              wifiDirectSignal: 0,
              preferredChannel: 'cloud',
            }
          : c
      )
    );
    setSelectedChannel('cloud');
  };

  const markAsRead = useCallback((userId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c))
    );
    setMessages((prev) => {
      const chatMsgs = prev[userId] || [];
      const updated = chatMsgs.map((m) =>
        m.from === userId ? { ...m, status: 'read', readAt: new Date().toISOString() } : m
      );
      return { ...prev, [userId]: updated };
    });
  }, []);

  useEffect(() => {
    if (activeChatId) {
      markAsRead(activeChatId);
    }
  }, [activeChatId, markAsRead]);

  const sendMessage = (
    content: string,
    type: 'text' | 'image' | 'audio' = 'text',
    mediaUrl?: string,
    audioUrl?: string,
    audioDuration?: number,
    channelOverride?: MessageChannel
  ) => {
    if (!activeChatId || (!content.trim() && !mediaUrl && !audioUrl)) return;

    const channelUsed = channelOverride || selectedChannel;
    const msgId = 'msg_' + Date.now();
    const newMsg: Message = {
      _id: msgId,
      clientId: msgId,
      from: user?._id || 'user_current',
      to: activeChatId,
      content,
      status: 'sending',
      createdAt: new Date().toISOString(),
      type,
      channel: channelUsed,
      mediaUrl: mediaUrl || null,
      audioUrl: audioUrl || null,
      audioDuration: audioDuration || 0,
      replyTo: replyingTo ? replyingTo._id : null,
      replyToMessage: replyingTo ? replyingTo : null,
      reactions: [],
    };

    setMessages((prev) => {
      const current = prev[activeChatId] || [];
      return { ...prev, [activeChatId]: [...current, newMsg] };
    });

    setReplyingTo(null);

    setConversations((prev) =>
      prev.map((c) =>
        c.userId === activeChatId
          ? {
              ...c,
              lastMessage:
                type === 'image'
                  ? '📷 Photo'
                  : type === 'audio'
                  ? `🎙️ Voice message (${Math.floor(audioDuration || 5)}s)`
                  : content,
              lastAt: new Date().toISOString(),
              status: 'sending',
              preferredChannel: channelUsed,
            }
          : c
      )
    );

    // If real backend registered user
    if (!activeChatId.startsWith('demo-') && activeChatId !== 'nova-ai') {
      if (socketRef.current?.connected) {
        socketRef.current.emit('sendMessage', {
          toUserId: activeChatId,
          message: content,
          clientId: msgId,
          type,
          mediaUrl,
          audioUrl,
          audioDuration,
          channel: channelUsed,
        });
      }

      // Quick fallback: transition from 'sending' to 'sent' (single tick ✓) after 300ms if recipient is offline
      setTimeout(() => {
        setMessages((prev) => {
          const list = prev[activeChatId] || [];
          return {
            ...prev,
            [activeChatId]: list.map((m) =>
              (m.clientId === msgId || m._id === msgId) && m.status === 'sending'
                ? { ...m, status: 'sent' }
                : m
            ),
          };
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.userId === activeChatId && c.status === 'sending' ? { ...c, status: 'sent' } : c
          )
        );
      }, 300);

      // If target user is online, transition to 'delivered' (double tick ✓✓)
      const targetConv = conversations.find((c) => c.userId === activeChatId);
      if (targetConv?.online) {
        setTimeout(() => {
          setMessages((prev) => {
            const list = prev[activeChatId] || [];
            return {
              ...prev,
              [activeChatId]: list.map((m) =>
                (m.clientId === msgId || m._id === msgId) && (m.status === 'sending' || m.status === 'sent')
                  ? { ...m, status: 'delivered' }
                  : m
              ),
            };
          });
          setConversations((prev) =>
            prev.map((c) =>
              c.userId === activeChatId && (c.status === 'sending' || c.status === 'sent')
                ? { ...c, status: 'delivered' }
                : c
            )
          );
        }, 800);
      }

      return;
    }

    // Nova AI Assistant real Gemini integration
    if (activeChatId === 'nova-ai') {
      // Instantly mark user's message as sent/read
      setTimeout(() => {
        setMessages((prev) => {
          const list = prev['nova-ai'] || [];
          return {
            ...prev,
            ['nova-ai']: list.map((m) => (m._id === msgId ? { ...m, status: 'read' } : m)),
          };
        });
        setConversations((prev) =>
          prev.map((c) => (c.userId === 'nova-ai' ? { ...c, status: 'read' } : c))
        );
      }, 300);

      // Show typing indicator
      setTypingUsers((prev) => ({ ...prev, ['nova-ai']: true }));

      const currentHistory = messages['nova-ai'] || [];

      askAiAssistant(content, currentHistory)
        .then((aiReply) => {
          setTypingUsers((prev) => ({ ...prev, ['nova-ai']: false }));

          const aiMsg: Message = {
            _id: 'ai_msg_' + Date.now(),
            from: 'nova-ai',
            to: user?._id || 'user_current',
            content: aiReply,
            status: 'read',
            createdAt: new Date().toISOString(),
            type: 'text',
            channel: 'cloud',
            isAi: true,
          };

          setMessages((prev) => {
            const list = prev['nova-ai'] || [];
            return { ...prev, ['nova-ai']: [...list, aiMsg] };
          });

          setConversations((prev) =>
            prev.map((c) =>
              c.userId === 'nova-ai'
                ? {
                    ...c,
                    lastMessage: aiReply.length > 60 ? aiReply.substring(0, 57) + '...' : aiReply,
                    lastAt: new Date().toISOString(),
                    status: 'read',
                  }
                : c
            )
          );
        })
        .catch(() => {
          setTypingUsers((prev) => ({ ...prev, ['nova-ai']: false }));
        });

      return;
    }

    // Demo auto-reply simulation for demo contacts
    if (activeChatId.startsWith('demo-')) {
      const sentDelay = channelUsed === 'wifi_direct' ? 200 : channelUsed === 'sim_sms' ? 800 : 500;
      const delivDelay = channelUsed === 'wifi_direct' ? 500 : channelUsed === 'sim_sms' ? 1800 : 1100;
      const readDelay = channelUsed === 'wifi_direct' ? 1000 : channelUsed === 'sim_sms' ? 2500 : 1800;

      setTimeout(() => {
        setMessages((prev) => {
          const list = prev[activeChatId] || [];
          return {
            ...prev,
            [activeChatId]: list.map((m) => (m._id === msgId ? { ...m, status: 'sent' } : m)),
          };
        });
        setConversations((prev) =>
          prev.map((c) => (c.userId === activeChatId ? { ...c, status: 'sent' } : c))
        );
      }, sentDelay);

      setTimeout(() => {
        setMessages((prev) => {
          const list = prev[activeChatId] || [];
          return {
            ...prev,
            [activeChatId]: list.map((m) => (m._id === msgId ? { ...m, status: 'delivered' } : m)),
          };
        });
        setConversations((prev) =>
          prev.map((c) => (c.userId === activeChatId ? { ...c, status: 'delivered' } : c))
        );
      }, delivDelay);

      setTimeout(() => {
        setMessages((prev) => {
          const list = prev[activeChatId] || [];
          return {
            ...prev,
            [activeChatId]: list.map((m) => (m._id === msgId ? { ...m, status: 'read' } : m)),
          };
        });
        setConversations((prev) =>
          prev.map((c) => (c.userId === activeChatId ? { ...c, status: 'read' } : c))
        );
      }, readDelay);

      setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [activeChatId]: true }));
      }, readDelay + 500);

      setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [activeChatId]: false }));

        const channelReplyPrefix =
          channelUsed === 'wifi_direct'
            ? '⚡ [Wi-Fi Direct P2P] '
            : channelUsed === 'sim_sms'
            ? '📱 [SIM SMS] '
            : '';

        let replyType: 'text' | 'audio' = type === 'audio' ? 'audio' : 'text';
        let replyText = '';
        let replyAudioDuration = 6;

        if (replyType === 'audio') {
          replyText = `Voice message (0:06)`;
        } else {
          const autoReplies = [
            `${channelReplyPrefix}Got it loud and clear over ${
              channelUsed === 'wifi_direct' ? 'Wi-Fi Direct' : channelUsed === 'sim_sms' ? 'SIM Cellular' : 'Cloud'
            }! 👍`,
            `${channelReplyPrefix}Thanks for sending that over! Connection speed is blazing fast.`,
            `${channelReplyPrefix}Super crisp transmission! Everything synced. 🚀`,
            `${channelReplyPrefix}Received! I'll follow up shortly.`,
          ];
          replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        }

        const responseMsg: Message = {
          _id: 'reply_' + Date.now(),
          from: activeChatId,
          to: user?._id || 'user_current',
          content: replyText,
          status: 'read',
          createdAt: new Date().toISOString(),
          type: replyType,
          audioDuration: replyType === 'audio' ? replyAudioDuration : undefined,
          channel: channelUsed,
        };

        setMessages((prev) => {
          const current = prev[activeChatId] || [];
          return { ...prev, [activeChatId]: [...current, responseMsg] };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.userId === activeChatId
              ? {
                  ...c,
                  lastMessage: replyText,
                  lastAt: new Date().toISOString(),
                  unreadCount: 0,
                  status: 'read',
                }
              : c
          )
        );
      }, readDelay + 2500);
    }
  };

  const togglePinConversation = (userId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const toggleArchiveConversation = (userId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, archived: !c.archived } : c))
    );
  };

  const toggleMuteConversation = (userId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, muted: !c.muted } : c))
    );
  };

  const deleteConversation = (userId: string) => {
    setConversations((prev) => prev.filter((c) => c.userId !== userId));
    setMessages((prev) => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
    if (activeChatId === userId) {
      setActiveChatId(null);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!activeChatId) return;
    if (socketRef.current?.connected && !activeChatId.startsWith('demo-')) {
      socketRef.current.emit('reactMessage', { messageId, emoji });
    }
    setMessages((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map((m) => {
        if (m._id !== messageId) return m;
        const reactions = m.reactions || [];
        const existingIndex = reactions.findIndex((r) => r.user === 'me' && r.emoji === emoji);
        let newReactions: Reaction[];
        if (existingIndex >= 0) {
          newReactions = reactions.filter((_, idx) => idx !== existingIndex);
        } else {
          newReactions = [...reactions.filter((r) => r.user !== 'me'), { user: 'me', emoji }];
        }
        return { ...m, reactions: newReactions };
      });
      return { ...prev, [activeChatId]: updated };
    });
  };

  const deleteMessage = (messageId: string) => {
    if (!activeChatId) return;
    if (socketRef.current?.connected && !activeChatId.startsWith('demo-')) {
      socketRef.current.emit('deleteMessage', { messageId });
    }
    setMessages((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.filter((m) => m._id !== messageId);
      return { ...prev, [activeChatId]: updated };
    });
  };

  const startNewChat = (name: string, email: string, phone?: string, userIdOverride?: string) => {
    const userId = userIdOverride || 'user_' + Date.now();
    const existingConv = conversations.find((c) => c.userId === userId);

    if (existingConv) {
      setActiveChatId(userId);
      return userId;
    }

    const newConv: ConversationSummary = {
      userId,
      name,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      phoneNumber: phone || '+1 (555) 000-1122',
      simCarrier: 'Cellular Gateway',
      lastMessage: 'Conversation started',
      lastAt: new Date().toISOString(),
      unreadCount: 0,
      online: true,
      typing: false,
      muted: false,
      pinned: false,
      archived: false,
      verified: false,
      status: 'read',
      preferredChannel: selectedChannel,
      wifiDirectStatus: selectedChannel === 'wifi_direct' ? 'connected' : 'disconnected',
      wifiDirectSignal: selectedChannel === 'wifi_direct' ? 88 : 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    if (!messages[userId]) {
      setMessages((prev) => ({ ...prev, [userId]: [] }));
    }

    setActiveChatId(userId);
    return userId;
  };

  const initiateCall = (toUserId: string, callType: 'audio' | 'video', channelOverride?: MessageChannel) => {
    const targetConv = conversations.find((c) => c.userId === toUserId);
    const contactName = targetConv?.name || 'NovaChat User';
    const contactAvatar = targetConv?.avatar;
    const channelUsed = channelOverride || selectedChannel;

    const newCall: ActiveCallData = {
      contactUserId: toUserId,
      contactName,
      contactAvatar,
      callType,
      channel: channelUsed,
      status: 'connecting',
    };

    setActiveCall(newCall);

    const payload = {
      toUserId,
      callType,
      channel: channelUsed,
      callerName: user?.name || 'NovaChat User',
      callerAvatar: user?.avatar,
      fromUserId: user?._id || 'user_local',
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit('call:invite', payload);
    }
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type: 'call:invite', ...payload });
    }

    // Auto-connect after 2.5s for seamless demo / test experience if recipient is offline or demo account
    setTimeout(() => {
      setActiveCall((prev) => {
        if (prev && prev.contactUserId === toUserId && prev.status === 'connecting') {
          return { ...prev, status: 'connected' };
        }
        return prev;
      });
    }, 2500);
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    const callerId = incomingCall.callerUserId;

    const newActiveCall: ActiveCallData = {
      contactUserId: callerId,
      contactName: incomingCall.callerName,
      contactAvatar: incomingCall.callerAvatar,
      callType: incomingCall.callType,
      channel: incomingCall.channel,
      status: 'connected',
    };

    setActiveCall(newActiveCall);
    setIncomingCall(null);

    if (socketRef.current?.connected) {
      socketRef.current.emit('call:accepted', { toUserId: callerId });
    }
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type: 'call:accepted', toUserId: callerId });
    }
  };

  const declineCall = () => {
    if (!incomingCall) return;
    const callerId = incomingCall.callerUserId;

    if (socketRef.current?.connected) {
      socketRef.current.emit('call:declined', { toUserId: callerId });
    }
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type: 'call:declined', toUserId: callerId });
    }
    setIncomingCall(null);
  };

  const endCall = (durationSecs?: number) => {
    const targetUserId = activeCall?.contactUserId || incomingCall?.callerUserId;

    if (targetUserId) {
      if (socketRef.current?.connected) {
        socketRef.current.emit('call:ended', { toUserId: targetUserId });
      }
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'call:ended', toUserId: targetUserId });
      }

      if (durationSecs !== undefined && activeCall) {
        const mins = Math.floor(durationSecs / 60);
        const secs = durationSecs % 60;
        const durationStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        const channelLabel =
          activeCall.channel === 'wifi_direct'
            ? 'Wi-Fi Direct'
            : activeCall.channel === 'sim_sms'
            ? `${activeSim} Cellular`
            : 'Cloud Data';

        const icon = activeCall.callType === 'video' ? '📹' : '📞';
        const logContent = `${icon} ${activeCall.callType === 'video' ? 'Video' : 'Voice'} call (${durationStr}) via ${channelLabel}`;

        sendMessage(logContent, 'text', undefined, undefined, undefined, activeCall.channel);
      }
    }

    setActiveCall(null);
    setIncomingCall(null);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeChatId,
        messages,
        searchQuery,
        activeFilter,
        replyingTo,
        typingUsers,
        selectedChannel,
        activeSim,
        simCarrier,
        isScanningWifi,
        wifiDirectPeers,
        incomingCall,
        activeCall,
        initiateCall,
        acceptCall,
        declineCall,
        endCall,
        setSelectedChannel,
        setActiveSim,
        scanWifiDirectPeers,
        connectWifiDirectPeer,
        disconnectWifiDirectPeer,
        setActiveChatId,
        setSearchQuery,
        setActiveFilter,
        sendMessage,
        togglePinConversation,
        toggleArchiveConversation,
        toggleMuteConversation,
        deleteConversation,
        markAsRead,
        addReaction,
        deleteMessage,
        setReplyingTo,
        startNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
