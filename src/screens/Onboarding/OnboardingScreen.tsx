import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import colors from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = ({ navigation }: Props) => {
  const finishOnboarding = useAuthStore((state) => state.finishOnboarding);

  const handleGetStarted = async () => {
    await finishOnboarding();
    navigation.replace('Main');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroContainer}>
        <Text style={styles.heroTitle}>Welcome to NovaChat</Text>
        <Text style={styles.heroSubtitle}>
          Your conversations, elevated with instant messaging, rich profiles, and secure sync.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fast Messaging</Text>
          <Text style={styles.cardText}>Send messages instantly with live socket updates and polished chat bubbles.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Smart Contacts</Text>
          <Text style={styles.cardText}>Create conversations with trusted contacts and manage your profile with ease.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Secure Login</Text>
          <Text style={styles.cardText}>Your account stays protected while your app experience stays premium.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handleGetStarted}>
        <Text style={styles.actionText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  heroContainer: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  actionText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});