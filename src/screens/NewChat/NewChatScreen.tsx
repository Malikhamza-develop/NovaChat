import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/common/Avatar';
import { searchUsers } from '../../services/api/userApi';
import { User } from '../../types/Auth';
import { MainStackParamList } from '../../navigation/types';
import { useChatStore } from '../../store/chatStore';
import colors from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'NewChat'>;

const NewChatScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setUsers([]);
      setError('');
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchUsers(normalizedQuery);
        if (isCurrent) setUsers(results);
      } catch {
        if (isCurrent) setError('Could not search people. Please try again.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  const openChat = (user: User) => {
    useChatStore.getState().createConversation({
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
      lastMessage: '',
      lastAt: new Date().toISOString(),
      unreadCount: 0,
      online: user.isOnline,
    });

    navigation.replace('Chat', {
      conversationId: user._id,
      receiverId: user._id,
      receiverName: user.name,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} style={styles.backButton} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Start a conversation</Text>
      </View>

      <View style={styles.searchWrap}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or email"
          placeholderTextColor={colors.placeholder}
          style={styles.search}
          autoCapitalize="none"
        />
        {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      </View>

      {error ? <Text style={styles.feedback}>{error}</Text> : null}
      {!error && query.trim().length > 0 && query.trim().length < 2 ? (
        <Text style={styles.feedback}>Type at least 2 characters to search.</Text>
      ) : null}

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable onPress={() => openChat(item)} style={({ pressed }) => [styles.userRow, pressed && styles.pressed]}>
            <Avatar name={item.name} image={item.avatar} size={52} online={item.isOnline} />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
            </View>
            <Icon name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
          </Pressable>
        )}
        ListEmptyComponent={query.trim().length >= 2 && !loading ? <Text style={styles.feedback}>No people found.</Text> : null}
      />
    </View>
  );
};

export default NewChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { height: 104, paddingTop: 42, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface },
  backButton: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  searchWrap: { margin: 16, paddingHorizontal: 16, height: 54, borderRadius: 18, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { flex: 1, color: colors.text, fontSize: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  userRow: { minHeight: 76, marginBottom: 10, padding: 12, borderRadius: 20, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: 14, marginRight: 8 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  email: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  feedback: { color: colors.textMuted, textAlign: 'center', paddingHorizontal: 24, paddingTop: 14, fontSize: 14 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
