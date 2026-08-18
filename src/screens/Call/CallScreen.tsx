import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2 } from 'lucide-react-native';
import { MainStackParamList } from '../../navigation/types';
import { Avatar } from '../../components/common/Avatar';
import { useCallStore } from '../../store/callStore';

type Props = NativeStackScreenProps<MainStackParamList, 'Call'>;

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const channelLabel = (channel?: string) => {
  switch (channel) {
    case 'wifi_direct':
      return 'Wi-Fi Direct P2P';
    case 'sim_sms':
      return 'SIM Cellular';
    default:
      return 'NovaChat Cloud';
  }
};

const CallScreen = ({ route, navigation }: Props) => {
  const {
    receiverId,
    receiverName,
    receiverAvatar,
    callType = 'audio',
    channel = 'cloud',
    isIncoming = false,
  } = route.params;

  const status = useCallStore((state) => state.status);
  const connectedAt = useCallStore((state) => state.connectedAt);
  const acceptCall = useCallStore((state) => state.acceptCall);
  const declineCall = useCallStore((state) => state.declineCall);
  const endCall = useCallStore((state) => state.endCall);
  const reset = useCallStore((state) => state.reset);

  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
  const [duration, setDuration] = useState(0);
  const pulse = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    if (isIncoming && status === 'idle') {
      useCallStore.setState({
        status: 'incoming',
        callType,
        remoteUserId: receiverId,
        remoteName: receiverName,
        remoteAvatar: receiverAvatar,
        channel: channel as 'cloud' | 'wifi_direct' | 'sim_sms',
      });
    }
  }, [isIncoming, status, callType, receiverId, receiverName, receiverAvatar, channel]);

  useEffect(() => {
    if (status !== 'outgoing' && status !== 'incoming') return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [status, pulse]);

  useEffect(() => {
    if (status !== 'connected' || !connectedAt) return;

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, connectedAt]);

  useEffect(() => {
    if (status === 'declined' || status === 'ended') {
      const timer = setTimeout(() => {
        reset();
        navigation.goBack();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [status, navigation, reset]);

  const statusText = () => {
    switch (status) {
      case 'outgoing':
        return 'Ringing...';
      case 'incoming':
        return `Incoming ${callType} call`;
      case 'connected':
        return formatDuration(duration);
      case 'declined':
        return 'Call declined';
      case 'ended':
        return 'Call ended';
      default:
        return 'Connecting...';
    }
  };

  const handleEnd = () => {
    endCall();
  };

  const handleAccept = () => {
    acceptCall();
  };

  const handleDecline = () => {
    declineCall();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topBar}>
        <Text style={styles.channelText}>{channelLabel(channel)}</Text>
        <Text style={styles.statusText}>{statusText()}</Text>
      </View>

      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Avatar
            src={receiverAvatar}
            name={receiverName}
            size="xl"
            online={status === 'connected'}
          />
        </Animated.View>
        <Text style={styles.name}>{receiverName}</Text>
        <Text style={styles.subtitle}>
          {callType === 'video' ? 'Video Call' : 'Voice Call'}
        </Text>
      </View>

      {callType === 'video' && status === 'connected' && (
        <View style={styles.videoPreview}>
          <Video size={48} color="#64748B" />
          <Text style={styles.videoHint}>Video stream active</Text>
        </View>
      )}

      <View style={styles.controls}>
        {status === 'incoming' ? (
          <View style={styles.incomingRow}>
            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
              <PhoneOff size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              {callType === 'video' ? (
                <Video size={28} color="#FFFFFF" />
              ) : (
                <Phone size={28} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.controlBtn, muted && styles.controlBtnActive]}
                onPress={() => setMuted((v) => !v)}
              >
                {muted ? <MicOff size={22} color="#FFFFFF" /> : <Mic size={22} color="#FFFFFF" />}
                <Text style={styles.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, speaker && styles.controlBtnActive]}
                onPress={() => setSpeaker((v) => !v)}
              >
                <Volume2 size={22} color="#FFFFFF" />
                <Text style={styles.controlLabel}>{speaker ? 'Speaker' : 'Earpiece'}</Text>
              </TouchableOpacity>

              {callType === 'video' && (
                <TouchableOpacity
                  style={[styles.controlBtn, !videoEnabled && styles.controlBtnActive]}
                  onPress={() => setVideoEnabled((v) => !v)}
                >
                  {videoEnabled ? (
                    <Video size={22} color="#FFFFFF" />
                  ) : (
                    <VideoOff size={22} color="#FFFFFF" />
                  )}
                  <Text style={styles.controlLabel}>{videoEnabled ? 'Camera' : 'Cam off'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
              <PhoneOff size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },
  topBar: {
    alignItems: 'center',
    marginBottom: 24,
  },
  channelText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 24,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 6,
  },
  videoPreview: {
    height: 160,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  videoHint: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 13,
  },
  controls: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  controlBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlBtnActive: {
    backgroundColor: '#4338CA',
    borderColor: '#6366F1',
  },
  controlLabel: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  endBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomingRow: {
    flexDirection: 'row',
    gap: 48,
    alignItems: 'center',
  },
  declineBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
