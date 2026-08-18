import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { ConversationSummary } from '../../types';
import { useChatStore } from '../../store/chatStore';
import { Avatar } from '../common/Avatar';
import {
  Phone,
  Video,
  Info,
  MoreVertical,
  ArrowLeft,
  Archive,
  Pin,
  VolumeX,
  Wifi,
  Smartphone,
  Cloud,
  Sparkles,
} from 'lucide-react-native';

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
  const [showMenu, setShowMenu] = useState(false);

  const selectedChannel = useChatStore((state) => state.selectedChannel);
  const setSelectedChannel = useChatStore((state) => state.setSelectedChannel);
  const connectWifiDirectPeer = useChatStore((state) => state.connectWifiDirectPeer);
  const disconnectWifiDirectPeer = useChatStore((state) => state.disconnectWifiDirectPeer);

  const isWifiConnected = effectiveConversation.wifiDirectStatus === 'connected';

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.mainHeader}>
        <View style={styles.leftContainer}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <ArrowLeft size={22} color="#F8FAFC" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.profileClickArea} onPress={effectiveOpenProfile}>
            <Avatar
              src={effectiveConversation.avatar}
              name={effectiveConversation.name}
              online={effectiveConversation.online}
              verified={effectiveConversation.verified}
              size="sm"
            />

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {effectiveConversation.name}
                </Text>
                {effectiveConversation.pinned && (
                  <Pin size={12} color="#F59E0B" fill="#F59E0B" style={styles.iconMargin} />
                )}
                {effectiveConversation.muted && (
                  <VolumeX size={12} color="#94A3B8" style={styles.iconMargin} />
                )}
              </View>

              <Text style={styles.statusText}>
                {effectiveIsTyping ? (
                  <Text style={styles.typingText}>typing...</Text>
                ) : effectiveConversation.online ? (
                  <Text style={styles.onlineText}>Active now</Text>
                ) : (
                  `Last seen ${effectiveConversation.lastSeen || 'recently'}`
                )}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.rightContainer}>
          {onOpenAiTools && (
            <TouchableOpacity style={styles.aiButton} onPress={onOpenAiTools}>
              <Sparkles size={14} color="#FDE047" />
              <Text style={styles.aiButtonText}>AI Tools</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onStartAudioCall || (() => {})}
          >
            <Phone size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onStartVideoCall || (() => {})}
          >
            <Video size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowMenu(true)}>
            <MoreVertical size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub Banner Channel Indicator */}
      {selectedChannel === 'wifi_direct' && (
        <View style={styles.bannerWifi}>
          <View style={styles.bannerRow}>
            <Wifi size={14} color="#10B981" />
            <Text style={styles.bannerWifiText}>
              Wi-Fi Direct: {isWifiConnected ? 'Connected P2P' : 'Peer Ready'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.pairBtn}
            onPress={() => {
              if (isWifiConnected) {
                disconnectWifiDirectPeer(effectiveConversation.userId);
              } else {
                connectWifiDirectPeer(effectiveConversation.userId);
              }
            }}
          >
            <Text style={styles.pairBtnText}>
              {isWifiConnected ? 'Disconnect' : 'Pair'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedChannel === 'sim_sms' && (
        <View style={styles.bannerSms}>
          <View style={styles.bannerRow}>
            <Smartphone size={14} color="#D97706" />
            <Text style={styles.bannerSmsText}>
              SIM SMS
            </Text>
          </View>
        </View>
      )}

      {/* More Options Modal */}
      {showMenu && (
        <Modal
          transparent
          animationType="fade"
          visible={showMenu}
          onRequestClose={() => setShowMenu(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowMenu(false)}>
            <View style={styles.menuBox}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  setShowMenu(false);
                  effectiveOpenProfile();
                }}
              >
                <Info size={16} color="#94A3B8" />
                <Text style={styles.menuLabel}>View Contact Info</Text>
              </TouchableOpacity>

              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>CHANNEL</Text>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  setSelectedChannel('cloud');
                  setShowMenu(false);
                }}
              >
                <Cloud size={16} color="#818CF8" />
                <Text style={styles.menuLabel}>Cloud Internet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  setSelectedChannel('wifi_direct');
                  setShowMenu(false);
                }}
              >
                <Wifi size={16} color="#10B981" />
                <Text style={styles.menuLabel}>Wi-Fi Direct P2P</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  setSelectedChannel('sim_sms');
                  setShowMenu(false);
                }}
              >
                <Smartphone size={16} color="#D97706" />
                <Text style={styles.menuLabel}>SIM Cellular SMS</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  onTogglePin();
                  setShowMenu(false);
                }}
              >
                <Pin size={16} color="#94A3B8" />
                <Text style={styles.menuLabel}>
                  {effectiveConversation.pinned ? 'Unpin Chat' : 'Pin Chat'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  onToggleMute();
                  setShowMenu(false);
                }}
              >
                <VolumeX size={16} color="#94A3B8" />
                <Text style={styles.menuLabel}>
                  {effectiveConversation.muted ? 'Unmute' : 'Mute'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  onToggleArchive();
                  setShowMenu(false);
                }}
              >
                <Archive size={16} color="#94A3B8" />
                <Text style={styles.menuLabel}>
                  {effectiveConversation.archived ? 'Unarchive' : 'Archive'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    elevation: 4,
  },
  mainHeader: {
    height: 60,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  profileClickArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  iconMargin: {
    marginLeft: 4,
  },
  statusText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  typingText: {
    color: '#818CF8',
    fontStyle: 'italic',
  },
  onlineText: {
    color: '#10B981',
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  actionBtn: {
    padding: 8,
    marginLeft: 2,
  },
  bannerWifi: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerSms: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerWifiText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  bannerSmsText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  pairBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pairBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: 220,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 4,
  },
});



