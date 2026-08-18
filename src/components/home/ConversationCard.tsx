import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { ConversationSummary } from '../../types';
import { Avatar } from '../common/Avatar';
import { MessageStatus } from '../chat/MessageStatus';
import { Pin, VolumeX, Archive, Trash2, MoreHorizontal, Wifi, Smartphone } from 'lucide-react-native';

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
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleCardClick}
      style={[
        styles.cardContainer,
        isActive && styles.activeCardContainer,
      ]}
    >
      <Avatar
        src={conversation.avatar}
        name={conversation.name}
        online={conversation.online}
        verified={conversation.verified}
        size="md"
      />

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.nameText,
                isActive ? styles.activeNameText : styles.normalNameText,
              ]}
              numberOfLines={1}
            >
              {conversation.name}
            </Text>
            {(conversation.userId === 'nova-ai' || conversation.isAi) && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>✨ AI</Text>
              </View>
            )}
            {conversation.pinned && (
              <Pin size={12} color="#F59E0B" fill="#F59E0B" style={styles.iconSpacing} />
            )}
            {conversation.muted && (
              <VolumeX size={12} color="#94A3B8" style={styles.iconSpacing} />
            )}
            {conversation.preferredChannel === 'wifi_direct' && (
              <View style={styles.channelBadge}>
                <Wifi size={12} color="#10B981" />
              </View>
            )}
            {conversation.preferredChannel === 'sim_sms' && (
              <View style={styles.channelBadgeSms}>
                <Smartphone size={12} color="#D97706" />
              </View>
            )}
          </View>

          <Text
            style={[
              styles.timeText,
              conversation.unreadCount > 0 ? styles.unreadTimeText : styles.normalTimeText,
            ]}
          >
            {formatTime(conversation.lastAt)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.lastMessageText,
              conversation.typing
                ? styles.typingText
                : conversation.unreadCount > 0
                ? styles.unreadMessageText
                : styles.normalMessageText,
            ]}
            numberOfLines={1}
          >
            {conversation.typing ? (
              'typing...'
            ) : (
              <>
                {conversation.lastMessage}
              </>
            )}
          </Text>

          <View style={styles.rightBadgeContainer}>
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowQuickMenu(!showQuickMenu);
              }}
              style={styles.moreButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreHorizontal size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Menu Popover Modal */}
      {showQuickMenu && (
        <Modal
          transparent
          animationType="fade"
          visible={showQuickMenu}
          onRequestClose={() => setShowQuickMenu(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowQuickMenu(false)}>
            <View style={styles.menuContainer}>
              {onPin && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onPin();
                    setShowQuickMenu(false);
                  }}
                >
                  <Pin size={14} color="#CBD5E1" />
                  <Text style={styles.menuText}>{conversation.pinned ? 'Unpin' : 'Pin'}</Text>
                </TouchableOpacity>
              )}
              {onMute && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onMute();
                    setShowQuickMenu(false);
                  }}
                >
                  <VolumeX size={14} color="#CBD5E1" />
                  <Text style={styles.menuText}>{conversation.muted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>
              )}
              {onArchive && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onArchive();
                    setShowQuickMenu(false);
                  }}
                >
                  <Archive size={14} color="#CBD5E1" />
                  <Text style={styles.menuText}>{conversation.archived ? 'Unarchive' : 'Archive'}</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={[styles.menuItem, styles.deleteItem]}
                  onPress={() => {
                    onDelete();
                    setShowQuickMenu(false);
                  }}
                >
                  <Trash2 size={14} color="#F43F5E" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  activeCardContainer: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  normalNameText: {
    color: '#F8FAFC',
  },
  activeNameText: {
    color: '#818CF8',
  },
  aiBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  iconSpacing: {
    marginRight: 4,
  },
  channelBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  channelBadgeSms: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    padding: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  unreadTimeText: {
    color: '#818CF8',
    fontWeight: '600',
  },
  normalTimeText: {
    color: '#64748B',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  normalMessageText: {
    color: '#94A3B8',
  },
  unreadMessageText: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  typingText: {
    color: '#818CF8',
    fontStyle: 'italic',
  },
  rightBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: 180,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    color: '#F8FAFC',
    fontSize: 14,
    marginLeft: 12,
  },
  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  deleteText: {
    color: '#F43F5E',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '600',
  },
});

