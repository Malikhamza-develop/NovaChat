import React, { useState, useEffect } from 'react';
import { Mic, Camera, MapPin, Bell, Shield, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion } from 'motion/react';

export type PermissionType = 'microphone' | 'camera' | 'geolocation' | 'notifications';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPermission?: PermissionType;
  onPermissionGranted?: (type: PermissionType) => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  requiredPermission,
  onPermissionGranted,
}) => {
  const [micState, setMicState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraState, setCameraState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [geoState, setGeoState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [notifState, setNotifState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [loadingType, setLoadingType] = useState<PermissionType | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if ('navigator' in window && 'permissions' in navigator) {
      try {
        const micStatus = await navigator.permissions.query({ name: 'microphone' as any });
        setMicState(micStatus.state as any);
        micStatus.onchange = () => setMicState(micStatus.state as any);

        const cameraStatus = await navigator.permissions.query({ name: 'camera' as any });
        setCameraState(cameraStatus.state as any);
        cameraStatus.onchange = () => setCameraState(cameraStatus.state as any);

        const geoStatus = await navigator.permissions.query({ name: 'geolocation' as any });
        setGeoState(geoStatus.state as any);
        geoStatus.onchange = () => setGeoState(geoStatus.state as any);
      } catch {
        // Fallback for browsers that don't support permissions.query
      }
    }

    if ('Notification' in window) {
      const perm = Notification.permission;
      setNotifState(perm === 'default' ? 'prompt' : (perm as any));
    }
  };

  const requestPermission = async (type: PermissionType) => {
    setLoadingType(type);
    try {
      if (type === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicState('granted');
        if (onPermissionGranted) onPermissionGranted('microphone');
      } else if (type === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setCameraState('granted');
        setMicState('granted');
        if (onPermissionGranted) onPermissionGranted('camera');
      } else if (type === 'geolocation') {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setGeoState('granted');
        if (onPermissionGranted) onPermissionGranted('geolocation');
      } else if (type === 'notifications') {
        if ('Notification' in window) {
          const res = await Notification.requestPermission();
          setNotifState(res === 'granted' ? 'granted' : 'denied');
          if (res === 'granted' && onPermissionGranted) onPermissionGranted('notifications');
        }
      }
    } catch (err) {
      console.warn(`Permission request for ${type} denied or errored:`, err);
      if (type === 'microphone') setMicState('denied');
      if (type === 'camera') setCameraState('denied');
      if (type === 'geolocation') setGeoState('denied');
      if (type === 'notifications') setNotifState('denied');
    } finally {
      setLoadingType(null);
    }
  };

  if (!isOpen) return null;

  const permissionsList: {
    type: PermissionType;
    title: string;
    desc: string;
    icon: any;
    state: 'prompt' | 'granted' | 'denied';
  }[] = [
    {
      type: 'microphone',
      title: 'Microphone Access',
      desc: 'Required to record voice notes and perform audio calls.',
      icon: Mic,
      state: micState,
    },
    {
      type: 'camera',
      title: 'Camera Access',
      desc: 'Required for high-definition video calls and photo capture.',
      icon: Camera,
      state: cameraState,
    },
    {
      type: 'geolocation',
      title: 'Location Services',
      desc: 'Required to share live location pin points with contacts.',
      icon: MapPin,
      state: geoState,
    },
    {
      type: 'notifications',
      title: 'Push Notifications',
      desc: 'Required to receive instant alerts when new messages arrive.',
      icon: Bell,
      state: notifState,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-300" />
            <h2 className="font-bold text-base">Mobile Device Permissions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            NovaChat directly requests browser and native device permissions required for voice notes, HD video calls, and location sharing.
          </p>

          <div className="space-y-3">
            {permissionsList.map((item) => {
              const IconComp = item.icon;
              const isHighlight = requiredPermission === item.type;
              const isGranted = item.state === 'granted';
              const isDenied = item.state === 'denied';

              return (
                <div
                  key={item.type}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isHighlight
                      ? 'bg-blue-50/80 dark:bg-slate-800 border-blue-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isGranted
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : isDenied
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {item.title}
                        {isGranted && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Granted
                          </span>
                        )}
                        {isDenied && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => requestPermission(item.type)}
                    disabled={loadingType === item.type || isGranted}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                      isGranted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                        : isHighlight
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs active:scale-95'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {loadingType === item.type
                      ? 'Asking...'
                      : isGranted
                      ? 'Allowed'
                      : 'Allow Access'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
