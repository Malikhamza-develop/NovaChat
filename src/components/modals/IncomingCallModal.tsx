import React from 'react';
import { Phone, PhoneOff, Video, Cloud, Wifi, Smartphone, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar } from '../common/Avatar';
import { MessageChannel } from '../../types';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  channel: MessageChannel;
  simSlot?: 'SIM 1' | 'SIM 2';
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  callerName,
  callerAvatar,
  callType,
  channel,
  simSlot = 'SIM 1',
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col items-center justify-between min-h-[460px] shadow-2xl relative overflow-hidden"
      >
        {/* Background pulsing glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

        {/* Top Channel Badge */}
        <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-700 text-xs font-semibold text-slate-200">
          {channel === 'cloud' && (
            <>
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Incoming Cloud HD Call</span>
            </>
          )}
          {channel === 'wifi_direct' && (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Incoming Wi-Fi Direct Call</span>
            </>
          )}
          {channel === 'sim_sms' && (
            <>
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Incoming Cellular Call ({simSlot})</span>
            </>
          )}
        </div>

        {/* Caller Avatar & Info */}
        <div className="my-auto flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping" />
            <Avatar
              src={callerAvatar}
              name={callerName}
              size="xl"
              className="ring-4 ring-emerald-500/60 shadow-2xl relative z-10"
            />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            {callerName}
          </h2>

          <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
            {callType === 'video' ? (
              <>
                <Video className="w-4 h-4" /> Incoming WhatsApp Video Call...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" /> Incoming WhatsApp Voice Call...
              </>
            )}
          </p>

          <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* Accept / Decline Action Buttons */}
        <div className="w-full flex items-center justify-around pt-4 border-t border-slate-800/80">
          <button
            onClick={onDecline}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-slate-300">Decline</span>
          </button>

          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95 animate-bounce">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-400">Accept</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
