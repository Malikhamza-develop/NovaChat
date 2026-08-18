import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Pressable } from 'react-native';
import { Message } from '../../types';
import { MessageStatus } from './MessageStatus';
import { Reply, Smile, Trash2, CornerUpLeft, Wifi, Smartphone, Cloud, Copy } from 'lucide-react-native';
import { AudioPlayer } from './AudioPlayer';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReply: (msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  onDelete: (msgId: string) => void;
  onRetry?: (msg: Message) => void;
  onCopy?: (text: string) => void;
}

const EMOJI_PICKER_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  onReply,
  onReact,
  onDelete,
  onRetry,
  onCopy,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderChannelBadge = () => {
    if (message.channel === 'wifi_direct') {
      return (
        <View style={[styles.channelBadge, isMe ? styles.channelBadgeMe : styles.channelBadgeWifi]}>
          <Wifi size={10} color={isMe ? '#A7F3D0' : '#10B981'} />
          <Text style={[styles.channelBadgeText, isMe ? styles.textMe : { color: '#10B981' }]}>
            P2P
          </Text>
        </View>
      );
    }
    if (message.channel === 'sim_sms') {
      return (
        <View style={[styles.channelBadge, isMe ? styles.channelBadgeMe : styles.channelBadgeSms]}>
          <Smartphone size={10} color={isMe ? '#FDE68A' : '#D97706'} />
          <Text style={[styles.channelBadgeText, isMe ? styles.textMe : { color: '#D97706' }]}>
            SMS
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.channelBadge, isMe ? styles.channelBadgeMe : styles.channelBadgeCloud]}>
        <Cloud size={10} color={isMe ? '#BFDBFE' : '#94A3B8'} />
        <Text style={[styles.channelBadgeText, isMe ? styles.textMe : { color: '#94A3B8' }]}>
          Cloud
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => setShowActions(true)}
        style={[styles.bubbleWrapper, isMe ? styles.myBubble : styles.otherBubble]}
      >
        {/* Reply Context */}
        {message.replyToMessage && (
          <View style={[styles.replyHeader, isMe ? styles.replyHeaderMe : styles.replyHeaderOther]}>
            <CornerUpLeft size={12} color="#94A3B8" />
            <Text style={styles.replyText} numberOfLines={1}>
              {message.replyToMessage.content}
            </Text>
          </View>
        )}

        {/* AI Badge */}
        {(message.from === 'nova-ai' || message.isAi) && !isMe && (
          <View style={styles.aiHeader}>
            <Text style={styles.aiHeaderBadge}>✨</Text>
            <Text style={styles.aiHeaderText}>Nova AI Assistant</Text>
          </View>
        )}

        {/* Media Attachment */}
        {message.mediaUrl && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: message.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          </View>
        )}

        {/* Content */}
        {message.type === 'audio' ||
        message.audioUrl ||
        message.content?.includes('Voice message') ||
        message.content?.startsWith('🎙️') ? (
          <AudioPlayer
            audioUrl={message.audioUrl}
            duration={message.audioDuration || 5}
            isMe={isMe}
            content={message.content}
          />
        ) : (
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
            {message.content}
          </Text>
        )}

        {/* Timestamp & Status */}
        <View style={styles.footerRow}>
          {renderChannelBadge()}
          <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextOther]}>
            {formatTime(message.createdAt)}
          </Text>
          {isMe && (
            message.status === 'failed' && onRetry ? (
              <TouchableOpacity onPress={() => onRetry(message)}>
                <MessageStatus status={message.status} />
              </TouchableOpacity>
            ) : (
              <MessageStatus status={message.status} />
            )
          )}
        </View>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <View style={styles.reactionsRow}>
            {message.reactions.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onReact(message._id, r.emoji)}
                style={styles.reactionChip}
              >
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Quick Actions & Reaction Modal */}
      {showActions && (
        <Modal
          transparent
          animationType="fade"
          visible={showActions}
          onRequestClose={() => setShowActions(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowActions(false)}>
            <View style={styles.actionCard}>
              <View style={styles.emojiPickerRow}>
                {EMOJI_PICKER_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      onReact(message._id, emoji);
                      setShowActions(false);
                    }}
                    style={styles.emojiButton}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.actionMenuDivider} />

              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => {
                  onReply(message);
                  setShowActions(false);
                }}
              >
                <Reply size={16} color="#F8FAFC" />
                <Text style={styles.actionRowText}>Reply</Text>
              </TouchableOpacity>

              {onCopy && message.content ? (
                <TouchableOpacity
                  style={styles.actionRowBtn}
                  onPress={() => {
                    onCopy(message.content);
                    setShowActions(false);
                  }}
                >
                  <Copy size={16} color="#F8FAFC" />
                  <Text style={styles.actionRowText}>Copy</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => {
                  onDelete(message._id);
                  setShowActions(false);
                }}
              >
                <Trash2 size={16} color="#F43F5E" />
                <Text style={[styles.actionRowText, styles.deleteText]}>Delete Message</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    flexDirection: 'column',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: '#4338CA',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  replyHeaderMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  replyHeaderOther: {
    backgroundColor: '#0F172A',
  },
  replyText: {
    color: '#CBD5E1',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  aiHeaderBadge: {
    fontSize: 12,
    marginRight: 4,
  },
  aiHeaderText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  mediaImage: {
    width: 200,
    height: 150,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#F8FAFC',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  channelBadgeMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  channelBadgeWifi: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  channelBadgeSms: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
  },
  channelBadgeCloud: {
    backgroundColor: '#0F172A',
  },
  channelBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 2,
  },
  textMe: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    marginRight: 4,
  },
  timeTextMe: {
    color: '#E0E7FF',
  },
  timeTextOther: {
    color: '#64748B',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reactionChip: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reactionEmoji: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    width: 280,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 8,
  },
  emojiPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emojiButton: {
    padding: 6,
  },
  emojiText: {
    fontSize: 22,
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 8,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  actionRowText: {
    color: '#F8FAFC',
    fontSize: 14,
    marginLeft: 12,
  },
  deleteText: {
    color: '#F43F5E',
    fontWeight: '600',
  },
});

