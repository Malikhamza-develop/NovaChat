import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Mic } from 'lucide-react-native';
import colors from '../../theme/colors';

interface AudioPlayerProps {
  audioUrl?: string | null;
  duration?: number;
  isMe: boolean;
  content?: string;
}

const WAVEFORM_BARS = [
  25, 40, 65, 30, 85, 95, 40, 70, 50, 90, 100, 60, 45, 80, 75, 35, 60, 90,
  80, 50, 30, 70, 40, 60, 80, 45, 30, 20,
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  duration = 5,
  isMe,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const totalDuration = duration || 5;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const stopPlayback = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  const startPlayback = (fromTime = 0) => {
    let cur = fromTime;
    setIsPlaying(true);
    setCurrentTime(cur);
    setProgress((cur / totalDuration) * 100);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      cur += 0.1 * playbackSpeed;
      if (cur >= totalDuration) {
        stopPlayback();
        setCurrentTime(0);
        setProgress(0);
      } else {
        setCurrentTime(cur);
        setProgress((cur / totalDuration) * 100);
      }
    }, 100);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(currentTime);
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleScrub = (barIndex: number) => {
    const newRatio = (barIndex + 1) / WAVEFORM_BARS.length;
    const newTime = newRatio * totalDuration;
    setCurrentTime(newTime);
    setProgress(newRatio * 100);
    if (isPlaying) {
      startPlayback(newTime);
    }
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={togglePlay}
          style={[
            styles.playButton,
            isMe ? styles.playButtonMe : styles.playButtonOther,
          ]}
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={20} color={isMe ? '#4F46E5' : '#FFFFFF'} fill={isMe ? '#4F46E5' : '#FFFFFF'} />
          ) : (
            <Play size={20} color={isMe ? '#4F46E5' : '#FFFFFF'} fill={isMe ? '#4F46E5' : '#FFFFFF'} />
          )}
        </TouchableOpacity>

        <View style={styles.waveformSection}>
          <View style={styles.waveformRow}>
            {WAVEFORM_BARS.map((height, idx) => {
              const barProgress = ((idx + 1) / WAVEFORM_BARS.length) * 100;
              const isPlayed = barProgress <= progress;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleScrub(idx)}
                  style={styles.barTouch}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.bar,
                      { height: `${height}%` },
                      isPlayed
                        ? isMe
                          ? styles.barPlayedMe
                          : styles.barPlayedOther
                        : isMe
                        ? styles.barUnplayedMe
                        : styles.barUnplayedOther,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.timeRow}>
              <Mic size={12} color={isMe ? 'rgba(255,255,255,0.75)' : colors.textSecondary} />
              <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
                {formatSecs(currentTime)} / {formatSecs(totalDuration)}
              </Text>
            </View>

            <TouchableOpacity onPress={handleSpeedToggle} style={[styles.speedBtn, isMe && styles.speedBtnMe]}>
              <Text style={[styles.speedText, isMe && styles.speedTextMe]}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minWidth: 210,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonMe: {
    backgroundColor: '#FFFFFF',
  },
  playButtonOther: {
    backgroundColor: '#4F46E5',
  },
  waveformSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 2,
  },
  barTouch: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  barPlayedMe: {
    backgroundColor: '#FFFFFF',
  },
  barPlayedOther: {
    backgroundColor: '#4F46E5',
  },
  barUnplayedMe: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  barUnplayedOther: {
    backgroundColor: '#CBD5E1',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  timeTextMe: {
    color: 'rgba(255,255,255,0.9)',
  },
  speedBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  speedBtnMe: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  speedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  speedTextMe: {
    color: '#FFFFFF',
  },
});
