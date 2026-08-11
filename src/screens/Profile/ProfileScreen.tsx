import React, { useEffect, useState } from 'react';
import {
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
import { useThemeStore } from '../../theme/themeStore';
import colors from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: Props) => {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [name, setName] = useState(user?.name ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <View style={styles.topBar}>
          <Pressable onPress={navigation.goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} accessibilityLabel="Go back">
            <Icon name="chevron-back" size={25} color={colors.text} />
          </Pressable>
          <View>
            <Text style={styles.eyebrow}>YOUR SPACE</Text>
            <Text style={styles.title}>Profile</Text>
          </View>
          <View style={styles.topSpacer} />
        </View>

        {user ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.avatarHaloOuter}>
                <View style={styles.avatarHaloInner}>
                  <Avatar name={name || user.name} image={avatar || undefined} size={92} online={user.isOnline} />
                </View>
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.identityName} numberOfLines={1}>{name || user.name}</Text>
                <View style={styles.presenceRow}>
                  <View style={styles.presenceDot} />
                  <Text style={styles.presenceText}>Nova identity active</Text>
                </View>
              </View>
              <View style={styles.orbit}>
                <Icon name="sparkles" size={17} color={colors.primary} />
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Public identity</Text>
              <Text style={styles.sectionCaption}>How people find you on NovaChat</Text>
            </View>

            <View style={styles.formCard}>
              <FieldLabel icon="person-outline" label="DISPLAY NAME" />
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Your display name"
                placeholderTextColor={colors.placeholder}
                maxLength={60}
              />

              <FieldLabel icon="image-outline" label="AVATAR URL" />
              <TextInput
                value={avatar}
                onChangeText={setAvatar}
                style={styles.input}
                placeholder="https://example.com/avatar.jpg"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <View style={styles.emailPanel}>
                <View style={styles.emailIcon}><Icon name="mail-outline" size={18} color={colors.primary} /></View>
                <View style={styles.emailCopy}>
                  <Text style={styles.emailLabel}>PRIVATE EMAIL</Text>
                  <Text style={styles.emailValue} numberOfLines={1}>{user.email}</Text>
                </View>
                <Icon name="lock-closed" size={15} color={colors.textMuted} />
              </View>

              {message ? <Feedback tone="success" text={message} /> : null}
              {error ? <Feedback tone="error" text={error} /> : null}

              <AuthButton title="Save changes" onPress={handleSave} loading={saving} style={styles.saveButton} />
            </View>

            <View style={styles.trustCard}>
              <View style={styles.trustIcon}><Icon name="shield-checkmark-outline" size={21} color={colors.success} /></View>
              <View style={styles.trustCopy}>
                <Text style={styles.trustTitle}>Your account, your control</Text>
                <Text style={styles.trustText}>Your email stays private and your profile changes sync securely across your devices.</Text>
              </View>
            </View>

            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [styles.themeToggle, pressed && styles.pressed]}
            >
              <Icon
                name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.primary}
              />
              <View style={styles.themeToggleCopy}>
                <Text style={styles.themeToggleTitle}>
                  {themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
                </Text>
                <Text style={styles.themeToggleCaption}>
                  Currently using {themeMode} theme
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            <Pressable onPress={logout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
              <Icon name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.logoutText}>Sign out of NovaChat</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.emptyState}>Your profile is not available right now.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const FieldLabel = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.fieldLabelRow}>
    <Icon name={icon} size={16} color={colors.primary} />
    <Text style={styles.fieldLabel}>{label}</Text>
  </View>
);

const Feedback = ({ tone, text }: { tone: 'success' | 'error'; text: string }) => (
  <View style={[styles.feedback, tone === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
    <Icon name={tone === 'success' ? 'checkmark-circle' : 'alert-circle'} size={18} color={tone === 'success' ? colors.success : colors.danger} />
    <Text style={[styles.feedbackText, tone === 'success' ? styles.successText : styles.errorText]}>{text}</Text>
  </View>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 42, paddingHorizontal: 20, paddingBottom: 40, overflow: 'hidden' },
  glowOne: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: '#DDE7FF', top: -98, right: -80, opacity: 0.9 },
  glowTwo: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#DDF6FF', top: 180, left: -80, opacity: 0.7 },
  topBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  backButton: { height: 42, width: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.78)', justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#94A3B8', shadowOpacity: 0.15, shadowRadius: 10, elevation: 2 },
  topSpacer: { width: 42 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  title: { color: colors.text, fontSize: 28, lineHeight: 33, fontWeight: '800', letterSpacing: -0.7 },
  heroCard: { minHeight: 150, borderRadius: 30, padding: 22, backgroundColor: '#172554', flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: '#1E3A8A', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 14 }, shadowRadius: 24, elevation: 8 },
  avatarHaloOuter: { width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(129,140,248,0.32)', justifyContent: 'center', alignItems: 'center' },
  avatarHaloInner: { width: 101, height: 101, borderRadius: 50.5, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  identityCopy: { flex: 1, marginLeft: 17 },
  identityName: { color: colors.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  presenceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9 },
  presenceDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#6EE7B7', marginRight: 7 },
  presenceText: { color: '#C7D2FE', fontSize: 12, fontWeight: '600' },
  orbit: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' },
  sectionHeading: { marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  sectionCaption: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: 18, shadowColor: '#64748B', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, elevation: 4 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5, marginBottom: 8 },
  fieldLabel: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  input: { height: 54, borderRadius: 16, backgroundColor: '#F5F7FF', paddingHorizontal: 16, color: colors.text, fontSize: 15, borderWidth: 1, borderColor: '#E7ECFA', marginBottom: 19 },
  emailPanel: { minHeight: 64, borderRadius: 17, backgroundColor: '#F7FAFF', padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EDF1FA' },
  emailIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E5E9FF', justifyContent: 'center', alignItems: 'center', marginRight: 11 },
  emailCopy: { flex: 1 },
  emailLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 0.8, fontWeight: '800' },
  emailValue: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 3 },
  feedback: { borderRadius: 14, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  feedbackSuccess: { backgroundColor: '#ECFDF5' },
  feedbackError: { backgroundColor: '#FEF2F2' },
  feedbackText: { fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 },
  successText: { color: colors.success },
  errorText: { color: colors.danger },
  saveButton: { width: '100%', marginTop: 18 },
  trustCard: { flexDirection: 'row', borderRadius: 22, padding: 16, marginTop: 18, backgroundColor: '#EFFAF5', borderWidth: 1, borderColor: '#D5F3E3' },
  trustIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#DDF6EA', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  trustCopy: { flex: 1 },
  trustTitle: { color: '#166534', fontSize: 14, fontWeight: '800' },
  trustText: { color: '#3F6B50', fontSize: 12, lineHeight: 18, marginTop: 3 },
  themeToggle: {
    minHeight: 60,
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 14,
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  themeToggleCopy: { flex: 1 },
  themeToggleTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  themeToggleCaption: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  logoutButton: { minHeight: 52, marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFF8F8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  emptyState: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 80 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
