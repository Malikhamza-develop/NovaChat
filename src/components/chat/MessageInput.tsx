import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { useChat } from '../../context/ChatContext';
import {
  Send,
  Paperclip,
  Smile,
  X,
  Mic,
  MapPin,
  CornerUpLeft,
  Wifi,
  Smartphone,
  Cloud,
  Trash2,
  Square,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessageInputProps {
  onSendMessage?: (
    content: string,
    type?: 'text' | 'image' | 'audio',
    mediaUrl?: string,
    audioUrl?: string,
    audioDuration?: number
  ) => void;
  onSend?: (text: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  insertedText?: string;
  onRequestPermission?: (type: 'microphone' | 'camera' | 'geolocation' | 'notifications') => void;
}

const COMMON_EMOJIS = ['😊', '😂', '👍', '❤️', '🔥', '🎉', '🚀', '🙌', '😍', '✨', '🙏', '💯'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSend,
  onTypingChange,
  replyingTo = null,
  onCancelReply = () => {},
  insertedText,
  onRequestPermission,
}) => {
  const { sendMessage: contextSendMessage, selectedChannel, setSelectedChannel, activeSim } = useChat();

  const handleSendAction = (
    content: string,
    type: 'text' | 'image' | 'audio' = 'text',
    mediaUrl?: string,
    audioUrl?: string,
    audioDuration?: number
  ) => {
    if (onSendMessage) {
      onSendMessage(content, type, mediaUrl, audioUrl, audioDuration);
    } else {
      contextSendMessage(content, type, mediaUrl, audioUrl, audioDuration);
    }
  };

  const [text, setText] = useState('');

  useEffect(() => {
    if (insertedText) {
      setText(insertedText);
    }
  }, [insertedText]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        // Detect supported MIME type
        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/aac')) {
            mimeType = 'audio/aac';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          }
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        // Capture data chunks every 100ms
        recorder.start(100);
      } else {
        if (onRequestPermission) onRequestPermission('microphone');
      }
    } catch (err) {
      console.warn('Microphone access note:', err);
      if (onRequestPermission) onRequestPermission('microphone');
    }
  };

  const handleShareLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          handleSendAction(`📍 Shared Location: https://maps.google.com/?q=${latitude},${longitude}`);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          if (onRequestPermission) {
            onRequestPermission('geolocation');
          } else {
            alert('Geolocation permission is required to share live location.');
          }
        }
      );
    } else if (onRequestPermission) {
      onRequestPermission('geolocation');
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }

    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const finishAndSendRecording = () => {
    const finalDuration = Math.max(1, recordingSeconds);

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const audioDataUrl = reader.result as string;
          handleSendAction(
            `Voice message (0:${finalDuration < 10 ? '0' : ''}${finalDuration})`,
            'audio',
            undefined,
            audioDataUrl,
            finalDuration
          );
        };
        reader.readAsDataURL(audioBlob);

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      // Fallback synthetic voice message
      handleSendAction(
        `Voice message (0:${finalDuration < 10 ? '0' : ''}${finalDuration})`,
        'audio',
        undefined,
        undefined,
        finalDuration
      );
    }

    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const handleSend = () => {
    if (!text.trim() && !previewImage) return;

    if (previewImage) {
      handleSendAction(text.trim() || 'Photo attachment', 'image', previewImage);
      setPreviewImage(null);
    } else {
      handleSendAction(text.trim(), 'text');
    }

    setText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPreviewImage(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSendButtonGradient = () => {
    if (selectedChannel === 'wifi_direct') {
      return 'bg-gradient-to-r from-emerald-600 to-teal-600';
    }
    if (selectedChannel === 'sim_sms') {
      return 'bg-gradient-to-r from-amber-600 to-orange-600';
    }
    return 'bg-gradient-to-r from-blue-600 to-indigo-600';
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
      {/* Active Channel Indicator Bar */}
      <div className="flex items-center justify-between mb-2 px-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          {selectedChannel === 'wifi_direct' && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              <Wifi className="w-3 h-3" /> Sending via Wi-Fi Direct P2P
            </span>
          )}
          {selectedChannel === 'sim_sms' && (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              <Smartphone className="w-3 h-3" /> Sending via {activeSim} Cellular SMS
            </span>
          )}
          {selectedChannel === 'cloud' && (
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
              <Cloud className="w-3 h-3" /> Sending via NovaChat Cloud
            </span>
          )}
        </div>

        {/* Channel Quick Cycle Switcher */}
        <div className="flex items-center gap-1 text-slate-400">
          {selectedChannel === 'sim_sms' && (
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mr-2">
              {text.length}/160 chars
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              const next =
                selectedChannel === 'wifi_direct'
                  ? 'sim_sms'
                  : selectedChannel === 'sim_sms'
                  ? 'cloud'
                  : 'wifi_direct';
              setSelectedChannel(next);
            }}
            className="hover:underline text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
          >
            Change Mode
          </button>
        </div>
      </div>

      {/* Replying Banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between bg-indigo-50 dark:bg-slate-800 border-l-4 border-indigo-600 rounded-r-lg p-2.5 mb-2 text-xs"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <CornerUpLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-indigo-900 dark:text-indigo-300 block">
                  Replying to message
                </span>
                <span className="text-slate-600 dark:text-slate-400 truncate block">
                  {replyingTo.content}
                </span>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-full text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Banner */}
      {previewImage && (
        <div className="relative inline-block mb-2 group">
          <img
            src={previewImage}
            alt="Upload preview"
            className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-500 shadow-sm"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Emoji Quick Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 p-3 mb-2 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((prev) => prev + emoji)}
                className="text-xl p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Voice Recording Bar Mode */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl px-4 py-2.5 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-rose-600 rounded-full animate-ping" />
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
              <Mic className="w-4 h-4" />
              <span>{formatSecs(recordingSeconds)}</span>
            </div>
            <span className="text-xs text-rose-500 dark:text-rose-400 font-medium hidden sm:inline">
              Recording Voice Note...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full transition-colors"
              title="Cancel Recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={finishAndSendRecording}
              className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
              title="Send Voice Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Normal Control Row */
        <div className="flex items-end gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleShareLocation}
            title="Share Live Location"
            className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
          >
            <MapPin className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emojis"
            className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
              showEmojiPicker
                ? 'text-indigo-600 bg-indigo-50 dark:bg-slate-800'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-2xl border border-transparent focus-within:border-indigo-500/50 transition-all">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedChannel === 'wifi_direct'
                  ? 'Type message over Direct Wi-Fi...'
                  : selectedChannel === 'sim_sms'
                  ? 'Type SMS text message...'
                  : 'Type a message...'
              }
              rows={1}
              className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none max-h-32 min-h-[40px]"
            />
          </div>

          {/* Send or Voice Record Button */}
          {text.trim() || previewImage ? (
            <button
              type="button"
              onClick={handleSend}
              className={`p-2.5 ${getSendButtonGradient()} text-white rounded-full hover:shadow-md hover:scale-105 transition-all flex-shrink-0`}
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              title="Record Voice Note"
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 rounded-full transition-colors flex-shrink-0"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
