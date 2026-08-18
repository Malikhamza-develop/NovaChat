import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Avatar } from '../common/Avatar';

import {
  Sun,
  Moon,
  Plus,
  Archive,
  Sparkles,
} from 'lucide-react-native';

import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../theme/useAppTheme';

interface HomeHeaderProps {
  onOpenNewChat?: () => void;
  archivedCount?: number;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onArchivePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onOpenNewChat,
  archivedCount = 0,
  onProfilePress,
  onArchivePress,
}) => {
  const user = useAuthStore((state) => state.user);
  const { mode, colors, toggleTheme, isDark } = useAppTheme();

  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.logoBadge}>
          <Sparkles size={20} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>NovaChat</Text>
          <Text style={styles.subtitleText}>REAL-TIME SYNC</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {onOpenNewChat && (
          <Pressable style={styles.actionButton} onPress={onOpenNewChat}>
            <Plus size={20} color={colors.primary} />
          </Pressable>
        )}

        {onArchivePress && (
          <Pressable style={styles.actionButton} onPress={onArchivePress}>
            <Archive size={20} color={colors.textSecondary} />
            {archivedCount > 0 && <View style={styles.archiveBadge} />}
          </Pressable>
        )}

        <Pressable style={styles.actionButton} onPress={() => void toggleTheme()}>
          {isDark ? (
            <Sun size={20} color="#F59E0B" />
          ) : (
            <Moon size={20} color={colors.primary} />
          )}
        </Pressable>

        {onProfilePress && (
          <Pressable style={styles.avatarButton} onPress={onProfilePress}>
            <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors'], isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: { flexDirection: 'row', alignItems: 'center' },
    logoBadge: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: isDark ? colors.primary : '#4338CA',
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleContainer: { marginLeft: 10 },
    titleText: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    subtitleText: { fontSize: 9, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
    rightSection: { flexDirection: 'row', alignItems: 'center' },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.border,
    },
    archiveBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#F59E0B',
    },
    avatarButton: { marginLeft: 8 },
  });
