import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import colors from '../../theme/colors';
import AuthButton from '../auth/AuthButton';

type Props = {
  onPress: () => void;
};

const EmptyChats = ({ onPress }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon
          name="chatbubbles"
          size={70}
          color={colors.primary}
        />
      </View>

      <Text style={styles.title}>
        No Conversations
      </Text>

      <Text style={styles.subtitle}>
        Start your first conversation and
        experience NovaChat.
      </Text>

      <AuthButton
        title="Start Chatting"
        onPress={onPress}
        style={styles.button}
      />
    </View>
  );
};

export default React.memo(EmptyChats);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },

  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },

  button: {
    width: '100%',
    marginTop: 36,
  },
});