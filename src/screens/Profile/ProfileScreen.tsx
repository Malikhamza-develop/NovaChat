import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/common/Avatar';
import AuthButton from '../../components/auth/AuthButton';
import { MainStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useAppTheme } from '../../theme/useAppTheme';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: Props) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const resetOnLogout = useChatStore((state) => state.resetOnLogout);
  const { mode, colors, toggleTheme, isDark } = useAppTheme();

  const [name, setName] = useState(user?.name ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    setName(user?.name ?? '');
    setAvatar(user?.avatar ?? '');
  }, [user]);

  const handleSave = async () => {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await updateProfile({ name, avatar });
      setMessage('Your profile has been updated.');
      setTimeout(() => setMessage(''), 2500);
    } catch {
      setError('We could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out of NovaChat?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);
  };

  const confirmSwitchAccount = () => {
    Alert.alert(
      'Switch account',
      'You will be signed out so you can log in with a different account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => void logout(),
        },
      ],
    );
  };

  const confirmClearCache = () => {
    Alert.alert(
      'Clear local cache',
      'This removes cached conversations from this device. Your cloud messages stay safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            resetOnLogout();
            Alert.alert('Done', 'Local cache cleared.');
          },
        },
      ],
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyState}>Loading profile...</Text>
        <AuthButton title="Go to login" onPress={() => void logout()} style={{ marginTop: 20, width: '80%' }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={navigation.goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Icon name="chevron-back" size={25} color={colors.text} />
          </Pressable>
          <View>
            <Text style={styles.eyebrow}>YOUR SPACE</Text>
            <Text style={styles.title}>Profile & Settings</Text>
          </View>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.heroCard}>
          <Avatar name={name || user.name} image={avatar || undefined} size={92} online={user.isOnline} />
          <View style={styles.identityCopy}>
            <Text style={styles.identityName} numberOfLines={1}>{name || user.name}</Text>
            <Text style={styles.presenceText}>{user.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Public identity</Text>
        <View style={styles.formCard}>
          <FieldLabel icon="person-outline" label="DISPLAY NAME" colors={colors} />
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Your display name"
            placeholderTextColor={colors.placeholder}
            maxLength={60}
          />
          <FieldLabel icon="image-outline" label="AVATAR URL" colors={colors} />
          <TextInput
            value={avatar}
            onChangeText={setAvatar}
            style={styles.input}
            placeholder="https://example.com/avatar.jpg"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {message ? <Feedback tone="success" text={message} colors={colors} /> : null}
          {error ? <Feedback tone="error" text={error} colors={colors} /> : null}
          <AuthButton title="Save changes" onPress={handleSave} loading={saving} style={styles.saveButton} />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <Pressable onPress={() => void toggleTheme()} style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}>
          <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.primary} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>{isDark ? 'Light mode' : 'Dark mode'}</Text>
            <Text style={styles.rowCaption}>Currently using {mode} theme</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={() => setNotificationsEnabled((v) => !v)}
          style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}
        >
          <Icon name={notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline'} size={22} color={colors.primary} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Push notifications</Text>
            <Text style={styles.rowCaption}>{notificationsEnabled ? 'Enabled' : 'Disabled'}</Text>
          </View>
          <View style={[styles.toggle, notificationsEnabled && styles.toggleOn]}>
            <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobOn]} />
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Account</Text>

        <Pressable onPress={confirmSwitchAccount} style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}>
          <Icon name="swap-horizontal-outline" size={22} color={colors.primary} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Switch account</Text>
            <Text style={styles.rowCaption}>Sign in with a different NovaChat account</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable onPress={confirmClearCache} style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}>
          <Icon name="trash-outline" size={22} color={colors.primary} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Clear local cache</Text>
            <Text style={styles.rowCaption}>Free space on this device</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable onPress={confirmSignOut} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <Icon name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sign out of NovaChat</Text>
        </Pressable>

        <Text style={styles.version}>NovaChat v1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const FieldLabel = ({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5, marginBottom: 8 }}>
    <Icon name={icon} size={16} color={colors.primary} />
    <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 1.1, fontWeight: '800' }}>{label}</Text>
  </View>
);

const Feedback = ({
  tone,
  text,
  colors,
}: {
  tone: 'success' | 'error';
  text: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) => (
  <View
    style={{
      borderRadius: 14,
      paddingVertical: 11,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
      backgroundColor: tone === 'success' ? (colors.success + '22') : (colors.danger + '22'),
    }}
  >
    <Icon
      name={tone === 'success' ? 'checkmark-circle' : 'alert-circle'}
      size={18}
      color={tone === 'success' ? colors.success : colors.danger}
    />
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
        color: tone === 'success' ? colors.success : colors.danger,
      }}
    >
      {text}
    </Text>
  </View>
);

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { justifyContent: 'center', alignItems: 'center', padding: 24 },
    content: { paddingTop: 42, paddingHorizontal: 20, paddingBottom: 40 },
    topBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
    backButton: {
      height: 42,
      width: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topSpacer: { width: 42 },
    eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
    title: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '800', letterSpacing: -0.7 },
    heroCard: {
      minHeight: 110,
      borderRadius: 24,
      padding: 18,
      backgroundColor: isDark ? colors.surfaceAlt : colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    identityCopy: { flex: 1, marginLeft: 16 },
    identityName: { color: isDark ? colors.text : colors.white, fontSize: 20, fontWeight: '800' },
    presenceText: { color: isDark ? colors.textSecondary : '#E0E7FF', fontSize: 13, marginTop: 4 },
    sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 22, marginBottom: 10 },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 14,
      color: colors.text,
      fontSize: 15,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    saveButton: { width: '100%', marginTop: 6 },
    rowCard: {
      minHeight: 62,
      borderRadius: 16,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      gap: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowCopy: { flex: 1 },
    rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    rowCaption: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    toggle: {
      width: 46,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      padding: 3,
      justifyContent: 'center',
    },
    toggleOn: { backgroundColor: colors.primary },
    toggleKnob: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.white,
    },
    toggleKnobOn: { alignSelf: 'flex-end' },
    logoutButton: {
      minHeight: 52,
      marginTop: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.danger + '55',
      backgroundColor: colors.danger + '15',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
    },
    logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
    emptyState: { color: colors.textSecondary, fontSize: 16, textAlign: 'center' },
    version: { color: colors.textMuted, textAlign: 'center', marginTop: 24, fontSize: 12 },
    pressed: { opacity: 0.75 },
  });

export default ProfileScreen;
