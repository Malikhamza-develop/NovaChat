import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';

interface AvatarProps {
  src?: string;
  image?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  online?: boolean;
  verified?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  image,
  name,
  size = 'md',
  online,
  verified,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarSrc = image || src;

  let dim = 44;
  let fontSize = 16;
  let indicatorDim = 14;

  if (typeof size === 'number') {
    dim = size;
    fontSize = Math.max(10, Math.floor(size * 0.38));
    indicatorDim = Math.max(8, Math.floor(size * 0.3));
  } else {
    switch (size) {
      case 'sm':
        dim = 32;
        fontSize = 12;
        indicatorDim = 10;
        break;
      case 'md':
        dim = 44;
        fontSize = 16;
        indicatorDim = 14;
        break;
      case 'lg':
        dim = 56;
        fontSize = 20;
        indicatorDim = 16;
        break;
      case 'xl':
        dim = 80;
        fontSize = 28;
        indicatorDim = 20;
        break;
    }
  }

  const getFirstLetterCapital = (n: string) => {
    if (!n) return '?';
    const trimmed = n.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  };

  const showImage = avatarSrc && !imageError;

  return (
    <View style={[{ width: dim, height: dim }, styles.container, style]}>
      {showImage ? (
        <Image
          source={{ uri: avatarSrc }}
          onError={() => setImageError(true)}
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View style={[{ width: dim, height: dim, borderRadius: dim / 2 }, styles.fallback]}>
          <Text style={[styles.fallbackText, { fontSize }]}>{getFirstLetterCapital(name)}</Text>
        </View>
      )}

      {online !== undefined && (
        <View
          style={[
            styles.indicator,
            {
              width: indicatorDim,
              height: indicatorDim,
              borderRadius: indicatorDim / 2,
              backgroundColor: online ? '#10B981' : '#94A3B8',
            },
          ]}
        />
      )}

      {verified && (
        <View style={styles.verifiedBadge}>
          <Check size={8} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



