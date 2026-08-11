import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/common/Avatar';
import { MainStackParamList } from '../../navigation/types';
import colors from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'UserProfile'>;

const UserProfileScreen = ({ navigation, route }: Props) => {
  const { name, avatar, online, lastSeen } = route.params;
  const presence = online ? 'Online now' : lastSeen ? `Last seen ${new Date(lastSeen).toLocaleString()}` : 'Offline';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glow} />
      <View style={styles.topBar}>
        <Pressable onPress={navigation.goBack} style={styles.backButton} accessibilityLabel="Go back">
          <Icon name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Contact profile</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.hero}>
        <View style={styles.avatarRing}><Avatar name={name} image={avatar} size={110} online={online} /></View>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.presence}><View style={[styles.presenceDot, !online && styles.offlineDot]} /><Text style={styles.presenceText}>{presence}</Text></View>
      </View>

      <View style={styles.actionCard}>
        <View style={styles.actionIcon}><Icon name="chatbubble-ellipses" size={21} color={colors.primary} /></View>
        <View style={styles.actionCopy}><Text style={styles.actionTitle}>Continue the conversation</Text><Text style={styles.actionText}>Your messages remain private and synced.</Text></View>
        <Pressable onPress={navigation.goBack} style={styles.messageButton}><Text style={styles.messageButtonText}>Message</Text></Pressable>
      </View>

      <Text style={styles.sectionLabel}>CONVERSATION</Text>
      <View style={styles.infoCard}>
        <InfoRow icon="shield-checkmark-outline" title="Private messaging" text="Messages are visible only to conversation participants." />
        <View style={styles.divider} />
        <InfoRow icon="notifications-outline" title="Notifications" text="Managed from your conversation preferences." />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <View style={styles.infoRow}><View style={styles.infoIcon}><Icon name={icon} size={20} color={colors.primary} /></View><View style={styles.infoCopy}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoText}>{text}</Text></View></View>
);

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, content: { paddingTop: 42, paddingHorizontal: 20, paddingBottom: 40, overflow: 'hidden' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#DDE7FF', top: -100, alignSelf: 'center' },
  topBar: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', elevation: 2 }, topTitle: { color: colors.text, fontSize: 16, fontWeight: '800' }, topSpacer: { width: 42 },
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 30 }, avatarRing: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#C7D2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, name: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }, presence: { flexDirection: 'row', alignItems: 'center', marginTop: 9 }, presenceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.online, marginRight: 7 }, offlineDot: { backgroundColor: colors.textMuted }, presenceText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  actionCard: { backgroundColor: '#172554', borderRadius: 26, padding: 17, flexDirection: 'row', alignItems: 'center', shadowColor: '#1E3A8A', shadowOpacity: 0.2, shadowRadius: 18, elevation: 6 }, actionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, actionCopy: { flex: 1 }, actionTitle: { color: colors.white, fontSize: 14, fontWeight: '800' }, actionText: { color: '#C7D2FE', fontSize: 11, marginTop: 3 }, messageButton: { backgroundColor: colors.white, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 10, marginLeft: 8 }, messageButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  sectionLabel: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1.2, fontWeight: '800', marginTop: 28, marginBottom: 10, marginLeft: 4 }, infoCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 17, elevation: 2 }, infoRow: { flexDirection: 'row', alignItems: 'center' }, infoIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, infoCopy: { flex: 1 }, infoTitle: { color: colors.text, fontSize: 14, fontWeight: '800' }, infoText: { color: colors.textSecondary, fontSize: 11, marginTop: 3, lineHeight: 16 }, divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
});
