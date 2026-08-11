import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string | null;
  duration?: number;
  isMe: boolean;
  content?: string;
}

// Generate self-contained playable WAV audio data URI so no external CDN or network is needed
function createSyntheticVoiceWav(durationSecs: number = 5): string {
  const sampleRate = 8000;
  const numSamples = Math.max(1, sampleRate * durationSecs);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Raw PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const cadence = Math.sin(t * 7) > -0.2 ? 0.6 : 0.1;
    const pitch = 240 + Math.sin(t * 3) * 50 + Math.sin(t * 11) * 25;
    const sample = Math.sin(2 * Math.PI * pitch * t) * 0.35 * cadence;
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration = 5,
  isMe,
  content,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [totalDuration, setTotalDuration] = useState<number>(duration || 5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Generate 28 fixed waveform bar heights for aesthetic voice visualization
  const waveformBars = useRef<number[]>([
    25, 40, 65, 30, 85, 95, 40, 70, 50, 90, 100, 60, 45, 80, 75, 35, 60, 90,
    80, 50, 30, 70, 40, 60, 80, 45, 30, 20,
  ]).current;

  // Real audio source fallback generated locally if custom URL is missing
  const [effectiveAudioUrl, setEffectiveAudioUrl] = useState<string>('');

  useEffect(() => {
    if (audioUrl) {
      setEffectiveAudioUrl(audioUrl);
    } else {
      const generated = createSyntheticVoiceWav(duration || 5);
      setEffectiveAudioUrl(generated);
      return () => {
        URL.revokeObjectURL(generated);
      };
    }
  }, [audioUrl, duration]);

  useEffect(() => {
    if (!effectiveAudioUrl) return;

    const audio = new Audio();
    audio.src = effectiveAudioUrl;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedData = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      if (audio.duration && audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedData);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedData);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [effectiveAudioUrl]);

  const playSynthesizedTone = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Synth sound fallback note:', e);
    }
  };

  const startFallbackPlaybackTimer = (startFromSecs: number = 0) => {
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    let cur = startFromSecs;
    setIsPlaying(true);
    playSynthesizedTone();

    synthTimerRef.current = setInterval(() => {
      cur += 0.1 * playbackSpeed;
      if (cur >= totalDuration) {
        if (synthTimerRef.current) clearInterval(synthTimerRef.current);
        synthTimerRef.current = null;
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
      } else {
        setCurrentTime(cur);
        setProgress((cur / totalDuration) * 100);
      }
    }, 100);
  };

  const togglePlay = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
        synthTimerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      let playedSuccessfully = false;

      if (audioRef.current) {
        try {
          audioRef.current.playbackRate = playbackSpeed;
          await audioRef.current.play();
          setIsPlaying(true);
          playedSuccessfully = true;
        } catch (err) {
          console.warn('Native HTMLAudio play note, using Web Audio synthesizer:', err);
        }
      }

      if (!playedSuccessfully) {
        startFallbackPlaybackTimer(currentTime);
      }
    }
  };

  const handleSpeedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);

    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleScrub = (barIndex: number) => {
    const newRatio = (barIndex + 1) / waveformBars.length;
    const newTime = newRatio * totalDuration;
    setCurrentTime(newTime);
    setProgress(newRatio * 100);

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    if (synthTimerRef.current && isPlaying) {
      startFallbackPlaybackTimer(newTime);
    }
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full min-w-[210px] sm:min-w-[250px] py-1">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md ${
            isMe
              ? 'bg-white text-indigo-600 hover:bg-slate-100'
              : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700'
          }`}
          title={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Visualization & Time */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {/* Interactive Waveform Bars */}
          <div className="flex items-center gap-0.5 h-7 cursor-pointer" title="Click to scrub audio">
            {waveformBars.map((height, idx) => {
              const barProgress = ((idx + 1) / waveformBars.length) * 100;
              const isPlayed = barProgress <= progress;

              return (
                <div
                  key={idx}
                  onClick={() => handleScrub(idx)}
                  className="flex-1 flex items-center justify-center h-full group"
                >
                  <div
                    style={{ height: `${height}%` }}
                    className={`w-full max-w-[3.5px] rounded-full transition-all duration-150 ${
                      isPlayed
                        ? isMe
                          ? 'bg-white shadow-xs shadow-white/50'
                          : 'bg-indigo-600 dark:bg-indigo-400'
                        : isMe
                        ? 'bg-white/35 hover:bg-white/60'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                    } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Time & Speed Controls */}
          <div
            className={`flex items-center justify-between text-[11px] font-mono tracking-tight ${
              isMe ? 'text-blue-100/90' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1">
              <Mic className="w-3 h-3 opacity-75" />
              <span>
                {formatSecs(currentTime)} / {formatSecs(totalDuration)}
              </span>
            </div>

            <button
              onClick={handleSpeedToggle}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                isMe
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200'
              }`}
              title="Change Playback Speed"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
