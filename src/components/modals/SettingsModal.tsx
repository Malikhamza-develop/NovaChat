import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import {
  X,
  Sun,
  Moon,
  LogOut,
  Check,
  Sparkles,
  Palette,
  Wifi,
  Smartphone,
  Radio,
  RefreshCw,
  Zap,
  ShieldCheck,
  Signal,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, updateUser, theme, toggleTheme, logout, openAuthModal } = useAuth();
  const {
    activeSim,
    setActiveSim,
    simCarrier,
    wifiDirectPeers,
    isScanningWifi,
    scanWifiDirectPeers,
    connectWifiDirectPeer,
    disconnectWifiDirectPeer,
  } = useChat();

  const [name, setName] = useState(user?.name || '');
  const [statusBio, setStatusBio] = useState(user?.statusBio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '+1 (555) 019-2834');
  const [wifiName, setWifiName] = useState(user?.wifiDirectName || 'Alex-Galaxy-S24');
  const [autoSmsFallback, setAutoSmsFallback] = useState(true);
  const [wifiP2pAutoConnect, setWifiP2pAutoConnect] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      statusBio,
      avatar: avatarUrl,
      phoneNumber: phone,
      wifiDirectName: wifiName,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
              Settings & Network Channels
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Profile Overview */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4 bg-indigo-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800">
              <Avatar
                src={avatarUrl}
                name={name || 'User'}
                size="lg"
                verified={user?.verified}
              />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cellular Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status / Bio
              </label>
              <input
                type="text"
                value={statusBio}
                onChange={(e) => setStatusBio(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Changes Saved!</span>
                </>
              ) : (
                'Save Profile Updates'
              )}
            </button>
          </form>

          {/* Wi-Fi Direct Peer-to-Peer Mesh Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Wifi className="w-4 h-4" /> Direct Wi-Fi P2P Mesh
              </h3>
              <button
                type="button"
                onClick={scanWifiDirectPeers}
                disabled={isScanningWifi}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isScanningWifi ? 'animate-spin' : ''}`} />
                {isScanningWifi ? 'Scanning...' : 'Scan Nearby Peers'}
              </button>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    Wi-Fi Direct Device Name
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Discovered by nearby NovaChat peers
                  </span>
                </div>
                <input
                  type="text"
                  value={wifiName}
                  onChange={(e) => setWifiName(e.target.value)}
                  className="bg-white dark:bg-slate-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 w-44 text-right font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Auto-connect trusted P2P devices
                </span>
                <input
                  type="checkbox"
                  checked={wifiP2pAutoConnect}
                  onChange={(e) => setWifiP2pAutoConnect(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Nearby Discovered Peers List */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Discovered Nearby P2P Peers
                </span>
                <div className="space-y-2">
                  {wifiDirectPeers.map((peer) => (
                    <div
                      key={peer.id}
                      className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {peer.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            IP: {peer.ipAddress} &bull; Signal: {peer.signal}%
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (peer.status === 'connected' && peer.associatedUserId) {
                            disconnectWifiDirectPeer(peer.associatedUserId);
                          } else if (peer.associatedUserId) {
                            connectWifiDirectPeer(peer.associatedUserId);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          peer.status === 'connected'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        {peer.status === 'connected' ? 'Disconnect' : 'Pair P2P'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dual SIM & Cellular SMS Gateway Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Dual SIM & Cellular SMS Messaging
            </h3>

            <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    Active SIM Card Selection
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Carrier: {simCarrier}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSim('SIM 1')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      activeSim === 'SIM 1'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    SIM 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSim('SIM 2')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      activeSim === 'SIM 2'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    SIM 2
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-100 dark:border-amber-900/40">
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block">
                    Auto SMS Fallback Mode
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically send via SIM SMS if Wi-Fi / Cloud drops
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSmsFallback}
                  onChange={(e) => setAutoSmsFallback(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" /> Interface Theme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs">Light Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-slate-800 text-indigo-300 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs">Dark Canvas</span>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={() => {
                onClose();
                openAuthModal();
              }}
              className="w-full py-2.5 px-4 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Log In to New Account / Switch User
            </button>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
