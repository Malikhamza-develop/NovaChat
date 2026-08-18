import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { HomeSectionItem } from '../../types/HomeSection';

import {
  StyleSheet,
  Alert,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

import {
  FlashList,
} from '@shopify/flash-list';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  MainStackParamList,
} from '../../navigation/types';

import { HomeHeader } from '../../components/home/HomeHeader';
import SearchBar from '../../components/home/SearchBar';
import SectionHeader from '../../components/home/SectionHeader';
import { ConversationCard } from '../../components/home/ConversationCard';
import EmptyChats from '../../components/home/EmptyChats';
import FloatingActionButton from '../../components/home/FloatingActionButton';
import { ConversationSummary } from '../../types/Message';
import { useChatStore } from '../../store/chatStore';
import { useAppTheme } from '../../theme/useAppTheme';
import { confirmArchive, confirmDelete } from '../../utils/confirmations';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const conversations = useChatStore((state) => state.conversations);
  const loading = useChatStore((state) => state.loading);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const archiveConversation = useChatStore((state) => state.archiveConversation);
  const pinConversation = useChatStore((state) => state.pinConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const toggleMuteConversation = useChatStore((state) => state.toggleMuteConversation);

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'pinned'>('all');

  const archivedCount = useMemo(
    () => conversations.filter((item) => item.archived).length,
    [conversations],
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const sections = useMemo(() => {
    const activeChats = conversations.filter((item) => {
      if (item.archived) return false;
      if (filterMode === 'unread') return item.unreadCount > 0;
      if (filterMode === 'pinned') return item.pinned;
      return true;
    });

    const sortConversations = (items: ConversationSummary[]) =>
      [...items].sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
      });

    const pinned = sortConversations(activeChats.filter((item) => item.pinned));
    const recent = sortConversations(activeChats.filter((item) => !item.pinned));

    const applySearch = (items: ConversationSummary[]) => {
      const keyword = search.trim().toLowerCase();
      if (!keyword) return items;
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.lastMessage.toLowerCase().includes(keyword),
      );
    };

    return {
      pinned: applySearch(pinned),
      recent: applySearch(recent),
    };
  }, [conversations, search, filterMode]);

  const listData = useMemo<HomeSectionItem[]>(() => {
    const data: HomeSectionItem[] = [];

    if (sections.pinned.length > 0) {
      data.push({ type: 'header', id: 'header-pinned', title: 'Pinned Chats', count: sections.pinned.length });
      sections.pinned.forEach((item) => {
        data.push({ type: 'conversation', id: item.userId, conversation: item });
      });
    }

    if (sections.recent.length > 0) {
      data.push({ type: 'header', id: 'header-recent', title: 'Recent Chats', count: sections.recent.length });
      sections.recent.forEach((item) => {
        data.push({ type: 'conversation', id: item.userId, conversation: item });
      });
    }

    return data;
  }, [sections]);

  const renderConversationCard = (item: ConversationSummary) => (
    <ConversationCard
      conversation={item}
      onPress={() =>
        navigation.navigate('Chat', {
          conversationId: item.userId,
          receiverId: item.userId,
          receiverName: item.name,
        })
      }
      onArchive={() => confirmArchive(item.name, () => void archiveConversation(item.userId))}
      onPin={() => void pinConversation(item.userId)}
      onMute={() => toggleMuteConversation(item.userId)}
      onDelete={() => confirmDelete(item.name, () => deleteConversation(item.userId))}
    />
  );

  return (
    <View style={styles.container}>
      <HomeHeader
        archivedCount={archivedCount}
        onProfilePress={() => navigation.navigate('Profile')}
        onNotificationPress={() => Alert.alert('Notifications', 'You are all caught up.')}
        onArchivePress={() => navigation.navigate('ArchivedChats')}
        onOpenNewChat={() => navigation.navigate('NewChat')}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        onFilterPress={() =>
          Alert.alert('Filter conversations', undefined, [
            { text: 'All chats', onPress: () => setFilterMode('all') },
            { text: 'Unread only', onPress: () => setFilterMode('unread') },
            { text: 'Pinned only', onPress: () => setFilterMode('pinned') },
            { text: 'Cancel', style: 'cancel' },
          ])
        }
      />

      {filterMode !== 'all' ? (
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>
            {filterMode === 'unread' ? 'Unread conversations' : 'Pinned conversations'}
          </Text>
          <Text onPress={() => setFilterMode('all')} style={styles.clearFilter}>
            Clear filter
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : listData.length === 0 ? (
        <EmptyChats onPress={() => navigation.navigate('NewChat')} />
      ) : (
        <>
          {sections.pinned.length > 0 && (
            <>
              <SectionHeader title="Pinned Chats" actionText={`${sections.pinned.length}`} />
              <FlashList
                data={sections.pinned}
                keyExtractor={(item) => item.userId}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => renderConversationCard(item)}
              />
            </>
          )}

          {sections.recent.length > 0 && (
            <>
              <SectionHeader title="Recent Chats" actionText={`${sections.recent.length}`} />
              <FlashList
                data={sections.recent}
                keyExtractor={(item) => item.userId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => renderConversationCard(item)}
              />
            </>
          )}
        </>
      )}

      <FloatingActionButton onNewChat={() => navigation.navigate('NewChat')} />
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: 120, paddingTop: 4 },
    filterRow: {
      marginHorizontal: 20,
      marginTop: -10,
      marginBottom: 13,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterLabel: { color: colors.primary, fontSize: 12, fontWeight: '700' },
    clearFilter: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    loadingText: { marginTop: 12, color: colors.textSecondary, fontSize: 14 },
  });

export default HomeScreen;
