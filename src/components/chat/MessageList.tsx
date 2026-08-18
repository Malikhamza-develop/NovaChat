import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import colors from '../../theme/colors';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
  contactName?: string;
  onReply: (msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  onDelete: (msgId: string) => void;
  onRetryMessage?: (message: Message) => void;
  onCopy?: (text: string) => void;
}

type ListItem =
  | { type: 'date'; id: string; date: string }
  | { type: 'message'; id: string; message: Message };

function groupMessagesByDate(msgs: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = '';

  msgs.forEach((m) => {
    let dateKey = 'Today';
    try {
      const d = new Date(m.createdAt);
      const today = new Date();
      if (d.toDateString() !== today.toDateString()) {
        dateKey = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      dateKey = 'Today';
    }

    if (dateKey !== lastDate) {
      items.push({ type: 'date', id: `date-${dateKey}`, date: dateKey });
      lastDate = dateKey;
    }

    items.push({ type: 'message', id: m._id, message: m });
  });

  return items;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isTyping,
  contactName,
  onReply,
  onReact,
  onDelete,
  onRetryMessage,
  onCopy,
}) => {
  const listRef = useRef<FlatList<ListItem>>(null);

  const listData = groupMessagesByDate(messages);

  useEffect(() => {
    if (listData.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, isTyping]);

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <MessageSquare size={32} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySubtitle}>
          Send a greeting or share a photo to start the conversation on NovaChat!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={listData}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      renderItem={({ item }) => {
        if (item.type === 'date') {
          return <DateSeparator date={item.date} />;
        }

        const msg = item.message;
        return (
          <MessageBubble
            message={msg}
            isMe={msg.from === currentUserId || msg.from === 'user_current'}
            onReply={onReply}
            onReact={onReact}
            onDelete={onDelete}
            onRetry={onRetryMessage}
            onCopy={onCopy}
          />
        );
      }}
      ListFooterComponent={isTyping ? <TypingIndicator name={contactName} /> : null}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingVertical: 16,
    flexGrow: 1,
  },
});
