import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

import Icon from 'react-native-vector-icons/Ionicons';

import colors from '../../theme/colors';

type Props = {
  onNewChat: () => void;
  onNewGroup?: () => void;
  onContacts?: () => void;
  onScanQR?: () => void;
};

const FloatingActionButton = ({
  onNewChat,
  onNewGroup,
  onContacts,
  onScanQR,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded(prev => !prev);

  return (
    <View style={styles.container}>
      {expanded && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          layout={Layout.springify()}
          style={styles.menu}
        >
          <FabItem
            icon="chatbubble"
            title="New Chat"
            onPress={onNewChat}
          />

          {onNewGroup ? <FabItem icon="people" title="New Group" onPress={onNewGroup} /> : null}
          {onContacts ? <FabItem icon="people-circle" title="Contacts" onPress={onContacts} /> : null}
          {onScanQR ? <FabItem icon="qr-code" title="Scan QR" onPress={onScanQR} /> : null}
        </Animated.View>
      )}

      <Pressable
        onPress={toggle}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.pressed,
        ]}
      >
        <Icon
          name={expanded ? 'close' : 'add'}
          size={30}
          color={colors.white}
        />
      </Pressable>
    </View>
  );
};

type FabItemProps = {
  icon: string;
  title: string;
  onPress?: () => void;
};

const FabItem = ({
  icon,
  title,
  onPress,
}: FabItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.item,
      pressed && styles.itemPressed,
    ]}
  >
    <Icon
      name={icon}
      size={22}
      color={colors.primary}
    />

    <Text style={styles.itemText}>
      {title}
    </Text>
  </Pressable>
);

export default React.memo(FloatingActionButton);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    alignItems: 'flex-end',
  },

  menu: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: colors.surface,

    borderRadius: 18,

    paddingHorizontal: 18,
    paddingVertical: 14,

    marginBottom: 12,

    minWidth: 180,
  },

  itemPressed: {
    opacity: 0.85,
  },

  itemText: {
    marginLeft: 14,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  fab: {
    width: 64,
    height: 64,

    borderRadius: 32,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.primary,

    elevation: 10,
  },

  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});
