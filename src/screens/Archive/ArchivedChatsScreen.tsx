import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FlashList } from '@shopify/flash-list';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ConversationCard } from '../../components/home/ConversationCard';
import SearchBar from '../../components/home/SearchBar';
import { MainStackParamList } from '../../navigation/types';
import { useChatStore } from '../../store/chatStore';
import { useAppTheme } from '../../theme/useAppTheme';
import { confirmDelete } from '../../utils/confirmations';

type Props = NativeStackScreenProps<MainStackParamList, 'ArchivedChats'>;

const ArchivedChatsScreen = ({ navigation }: Props) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const conversations = useChatStore((state) => state.conversations);
  const unarchiveConversation = useChatStore((state) => state.unarchiveConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const pinConversation = useChatStore((state) => state.pinConversation);
  const [search, setSearch] = useState('');

  const archivedChats = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return conversations.filter((item) => item.archived).filter((item) =>
      !keyword || item.name.toLowerCase().includes(keyword) || item.lastMessage.toLowerCase().includes(keyword),
    );
  }, [conversations, search]);

  return (
    <View style={styles.container}>
      <View style={styles.headerGlow} />
      <View style={styles.topBar}>
        <Pressable onPress={navigation.goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>YOUR SPACE</Text>
          <Text style={styles.title}>Archived</Text>
        </View>
        <View style={styles.archiveBadge}><Icon name="archive" size={17} color={colors.primary} /></View>
      </View>

      <View style={styles.introCard}>
        <View style={styles.introIcon}><Icon name="archive-outline" size={24} color={colors.primary} /></View>
        <View style={styles.introCopy}><Text style={styles.introTitle}>Quiet, never gone</Text><Text style={styles.introText}>Archived chats stay private and out of your main inbox until you bring them back.</Text></View>
      </View>

      <SearchBar value={search} onChangeText={setSearch} />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Archived conversations</Text>
        <Text style={styles.count}>{archivedChats.length}</Text>
      </View>

      {archivedChats.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Icon name="archive-outline" size={34} color={colors.primary} /></View>
          <Text style={styles.emptyTitle}>{search ? 'No matching chats' : 'Nothing archived yet'}</Text>
          <Text style={styles.emptyText}>{search ? 'Try a different search term.' : 'Archive a conversation to give your inbox more room to breathe.'}</Text>
        </View>
      ) : (
        <FlashList
          data={archivedChats}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              onPress={() => navigation.navigate('Chat', { conversationId: item.userId, receiverId: item.userId, receiverName: item.name })}
              onArchive={() => void unarchiveConversation(item.userId)}
              onPin={() => void pinConversation(item.userId)}
              onDelete={() => confirmDelete(item.name, () => deleteConversation(item.userId))}
            />
          )}
        />
      )}
    </View>
  );
};

export default ArchivedChatsScreen;

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 42, overflow: 'hidden' },
    headerGlow: { position: 'absolute', top: -110, right: -85, height: 250, width: 250, borderRadius: 125, backgroundColor: colors.primary + '22' },
    topBar: { height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 2, borderWidth: 1, borderColor: colors.border },
    headerCopy: { flex: 1, marginLeft: 12 },
    eyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
    title: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '800', letterSpacing: -0.6 },
    archiveBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    introCard: { marginHorizontal: 20, marginTop: 22, marginBottom: 20, backgroundColor: colors.surfaceAlt, borderRadius: 25, padding: 17, flexDirection: 'row', borderWidth: 1, borderColor: colors.border },
    introIcon: { height: 48, width: 48, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
    introCopy: { flex: 1 },
    introTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
    introText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 4 },
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 8 },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
    count: { minWidth: 25, height: 25, borderRadius: 13, backgroundColor: colors.surfaceAlt, color: colors.primary, fontSize: 12, fontWeight: '800', textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden' },
    list: { paddingBottom: 24 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 42, paddingBottom: 90 },
    emptyIcon: { height: 78, width: 78, borderRadius: 26, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
    emptyText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 20, fontSize: 13, marginTop: 7 },
    pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  });
