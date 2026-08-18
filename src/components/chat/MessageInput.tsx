import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Message } from '../../types';
import { useChatStore } from '../../store/chatStore';
import {
  Send,
  Smile,
  X,
  Mic,
  MapPin,
  CornerUpLeft,
  Wifi,
  Smartphone,
  Cloud,
  Trash2,
} from 'lucide-react-native';

interface MessageInputProps {
  onSendMessage?: (
    content: string,
    type?: 'text' | 'image' | 'audio',
    mediaUrl?: string,
    audioUrl?: string,
    audioDuration?: number
  ) => void;
  onSend?: (text: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  insertedText?: string;
  onRequestPermission?: (type: 'microphone' | 'camera' | 'geolocation' | 'notifications') => void;
}

const COMMON_EMOJIS = ['😊', '😂', '👍', '❤️', '🔥', '🎉', '🚀', '🙌', '😍', '✨', '🙏', '💯'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSend,
  onTypingChange,
  replyingTo = null,
  onCancelReply = () => {},
  insertedText,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const selectedChannel = useChatStore((state) => state.selectedChannel);
  const setSelectedChannel = useChatStore((state) => state.setSelectedChannel);
  const activeSim = 'SIM 1';

  useEffect(() => {
    if (insertedText) {
      setText(insertedText);
    }
  }, [insertedText]);

  const onTypingChangeRef = useRef(onTypingChange);
  onTypingChangeRef.current = onTypingChange;

  useEffect(() => {
    onTypingChangeRef.current?.(text.trim().length > 0);
  }, [text]);

  const handleSendAction = (
    content: string,
    type: 'text' | 'image' | 'audio' = 'text',
    mediaUrl?: string,
    audioUrl?: string,
    audioDuration?: number
  ) => {
    if (onSendMessage) {
      onSendMessage(content, type, mediaUrl, audioUrl, audioDuration);
    } else if (onSend && type === 'text') {
      onSend(content);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    handleSendAction(text.trim(), 'text');
    setText('');
    setShowEmojiPicker(false);
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const finishRecording = () => {
    handleSendAction('Voice message (0:05)', 'audio', undefined, undefined, 5);
    setIsRecording(false);
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };

  const handleShareLocation = () => {
    handleSendAction('📍 Shared Location: https://maps.google.com/?q=37.7749,-122.4194');
  };

  const cycleChannel = () => {
    setSelectedChannel(
      selectedChannel === 'wifi_direct'
        ? 'sim_sms'
        : selectedChannel === 'sim_sms'
          ? 'cloud'
          : 'wifi_direct',
    );
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.channelRow}>
        {selectedChannel === 'wifi_direct' && (
          <View style={[styles.channelTag, styles.channelTagWifi]}>
            <Wifi size={12} color="#10B981" />
            <Text style={[styles.channelTagText, { color: '#10B981' }]}>Wi-Fi Direct P2P</Text>
          </View>
        )}
        {selectedChannel === 'sim_sms' && (
          <View style={[styles.channelTag, styles.channelTagSms]}>
            <Smartphone size={12} color="#D97706" />
            <Text style={[styles.channelTagText, { color: '#D97706' }]}>
              {activeSim} Cellular SMS
            </Text>
          </View>
        )}
        {selectedChannel === 'cloud' && (
          <View style={[styles.channelTag, styles.channelTagCloud]}>
            <Cloud size={12} color="#818CF8" />
            <Text style={[styles.channelTagText, { color: '#818CF8' }]}>NovaChat Cloud</Text>
          </View>
        )}

        <TouchableOpacity onPress={cycleChannel}>
          <Text style={styles.changeModeText}>Switch</Text>
        </TouchableOpacity>
      </View>

      {replyingTo && (
        <View style={styles.replyBanner}>
          <CornerUpLeft size={16} color="#818CF8" />
          <View style={styles.replyContent}>
            <Text style={styles.replyTitle}>Replying to message</Text>
            <Text style={styles.replyBody} numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <X size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      )}

      {showEmojiPicker && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiPicker}>
          {COMMON_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => setText((prev) => prev + emoji)}
              style={styles.emojiChip}
            >
              <Text style={styles.emojiChipText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {isRecording ? (
        <View style={styles.recordingBar}>
          <View style={styles.recordingInfo}>
            <Mic size={18} color="#F43F5E" />
            <Text style={styles.recordingText}>Recording voice note...</Text>
          </View>
          <View style={styles.recordingActions}>
            <TouchableOpacity onPress={cancelRecording} style={styles.recIconBtn}>
              <Trash2 size={20} color="#F43F5E" />
            </TouchableOpacity>
            <TouchableOpacity onPress={finishRecording} style={styles.sendRecBtn}>
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={handleShareLocation}>
            <MapPin size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={
              selectedChannel === 'wifi_direct'
                ? 'Type message over Direct Wi-Fi...'
                : selectedChannel === 'sim_sms'
                ? 'Type SMS text message...'
                : 'Type a message...'
            }
            placeholderTextColor="#64748B"
            multiline
            style={styles.textInput}
          />

          {text.trim() ? (
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconBtn} onPress={startRecording}>
              <Mic size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  channelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  channelTagWifi: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  channelTagSms: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
  },
  channelTagCloud: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  channelTagText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  changeModeText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '600',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyContent: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  replyTitle: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  replyBody: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  emojiPicker: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  emojiChip: {
    padding: 6,
    marginRight: 6,
  },
  emojiChipText: {
    fontSize: 20,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F43F5E',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingText: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recIconBtn: {
    padding: 6,
    marginRight: 8,
  },
  sendRecBtn: {
    backgroundColor: '#F43F5E',
    padding: 8,
    borderRadius: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginHorizontal: 4,
  },
  sendBtn: {
    backgroundColor: '#6366F1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
