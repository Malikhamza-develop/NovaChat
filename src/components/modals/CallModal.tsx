import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Wifi,
  Cloud,
  Smartphone,
  Volume2,
  VolumeX,
  RefreshCw,
  Signal,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from '../common/Avatar';
import { MessageChannel } from '../../types';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar?: string;
  contactUserId?: string;
  type: 'audio' | 'video';
  initialChannel?: MessageChannel;
  simCarrier?: string;
  activeSim?: 'SIM 1' | 'SIM 2';
  onCallEnded?: (durationSecs: number, channelUsed: MessageChannel, callType: 'audio' | 'video') => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  contactName,
  contactAvatar,
  type,
  initialChannel = 'cloud',
  simCarrier = 'Verizon 5G',
  activeSim = 'SIM 1',
  onCallEnded,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [channel, setChannel] = useState<MessageChannel>(initialChannel);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [wifiSignal] = useState(94); // Mock live signal strength for Wi-Fi Direct

  useEffect(() => {
    if (!isOpen) return;

    setCallDuration(0);
    setCallState('connecting');
    setChannel(initialChannel);

    let localStream: MediaStream | null = null;

    const startCall = async () => {
      try {
        if (channel !== 'sim_sms' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const constraints = {
            audio: true,
            video: type === 'video',
          };
          localStream = await navigator.mediaDevices.getUserMedia(constraints);
          setStream(localStream);
        }
        setCallState('connected');
      } catch (err) {
        console.warn('Hardware stream setup note:', err);
        setCallState('connected'); // Fallback simulated call feed if camera/mic is restricted
      }
    };

    startCall();

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, type, initialChannel]);

  useEffect(() => {
    if (localVideoRef.current && stream && !isVideoOff && channel !== 'sim_sms') {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream, isVideoOff, channel]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (channel === 'sim_sms') {
      alert('SIM Cellular voice calls do not support video. Switch to Cloud or Wi-Fi Direct for video call.');
      return;
    }
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const flipCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCallState('ended');

    if (onCallEnded) {
      onCallEnded(callDuration, channel, type);
    }

    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col justify-between min-h-[600px] h-[92vh] max-h-[720px] p-5 sm:p-7 relative select-none"
      >
        {/* Top Header Controls & Transport Channels */}
        <div className="w-full flex flex-col gap-3 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-800/90 text-emerald-400 px-3 py-1 rounded-full border border-slate-700/80 text-[11px] font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WhatsApp E2E Encrypted</span>
            </div>

            <div className="text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/80">
              {callState === 'connecting' ? 'Calling...' : formatDuration(callDuration)}
            </div>
          </div>

          {/* Transport Route Switcher Bar (Cloud vs Wi-Fi Direct vs SIM) */}
          <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-1 shadow-inner">
            <button
              onClick={() => {
                setChannel('cloud');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                channel === 'cloud'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud Data</span>
            </button>

            <button
              onClick={() => {
                setChannel('wifi_direct');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                channel === 'wifi_direct'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Wi-Fi Direct</span>
            </button>

            <button
              onClick={() => {
                setChannel('sim_sms');
                setIsVideoOff(true);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                channel === 'sim_sms'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{activeSim} Cellular</span>
            </button>
          </div>
        </div>

        {/* Center Display: Live Feed or Contact Avatar */}
        <div className="my-auto flex flex-col items-center justify-center text-center relative w-full py-4">
          {type === 'video' && !isVideoOff && channel !== 'sim_sms' ? (
            <div className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {stream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isFrontCamera ? 'transform -scale-x-100' : ''}`}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Video className="w-12 h-12 text-slate-600 animate-pulse" />
                  <span className="text-xs font-medium">Connecting camera feed...</span>
                </div>
              )}

              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-medium text-slate-200 flex items-center gap-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{isFrontCamera ? 'Front HD Camera' : 'Rear Camera'}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                {/* Ripple animation around avatar */}
                <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="absolute -inset-8 rounded-full bg-indigo-500/10 animate-pulse" />
                <Avatar
                  src={contactAvatar}
                  name={contactName}
                  size="xl"
                  className="ring-4 ring-emerald-500/50 shadow-2xl relative z-10"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                {contactName}
              </h2>

              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300 font-medium shadow-xs">
                {channel === 'cloud' && (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cloud IP Voice Call • HD 1080p</span>
                  </>
                )}
                {channel === 'wifi_direct' && (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>P2P Direct Mesh Call ({wifiSignal}% Signal)</span>
                  </>
                )}
                {channel === 'sim_sms' && (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>{activeSim} Direct GSM ({simCarrier})</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom In-Call WhatsApp Style Controls */}
        <div className="w-full flex flex-col gap-4 z-20 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-around max-w-md mx-auto w-full">
            {/* Speaker Toggle */}
            <button
              onClick={toggleSpeaker}
              className={`p-3.5 sm:p-4 rounded-full transition-all flex flex-col items-center gap-1 ${
                isSpeakerOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'
              }`}
              title={isSpeakerOn ? 'Speakerphone Active' : 'Earpiece Active'}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
              <span className="text-[10px] font-semibold text-slate-300">
                {isSpeakerOn ? 'Speaker' : 'Earpiece'}
              </span>
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              disabled={channel === 'sim_sms'}
              className={`p-3.5 sm:p-4 rounded-full transition-all flex flex-col items-center gap-1 ${
                channel === 'sim_sms'
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                  : isVideoOff
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
              <span className="text-[10px] font-semibold text-slate-300">
                {isVideoOff ? 'Cam Off' : 'Cam On'}
              </span>
            </button>

            {/* Camera Flip (Only when video is enabled) */}
            {type === 'video' && !isVideoOff && channel !== 'sim_sms' && (
              <button
                onClick={flipCamera}
                className="p-3.5 sm:p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full transition-all flex flex-col items-center gap-1"
                title="Flip Camera"
              >
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] font-semibold text-slate-300">Flip</span>
              </button>
            )}

            {/* Mute Microphone */}
            <button
              onClick={toggleMute}
              className={`p-3.5 sm:p-4 rounded-full transition-all flex flex-col items-center gap-1 ${
                isMuted
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
              <span className="text-[10px] font-semibold text-slate-300">
                {isMuted ? 'Muted' : 'Mute'}
              </span>
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex flex-col items-center gap-1"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
              <span className="text-[10px] font-semibold text-white">End</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
