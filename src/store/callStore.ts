import { create } from 'zustand';
import { MessageChannel } from '../types/Message';
import { navigateToCall } from '../navigation/navigationRef';
import {
  acceptCall as emitAcceptCall,
  declineCall as emitDeclineCall,
  endCall as emitEndCall,
  inviteCall as emitInviteCall,
} from '../services/socket/socket';

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected' | 'declined' | 'ended';

interface CallParticipant {
  remoteUserId: string;
  remoteName: string;
  remoteAvatar?: string;
  callType: CallType;
  channel: MessageChannel;
}

interface StartOutgoingCallPayload extends CallParticipant {
  callerName: string;
  callerAvatar?: string;
}

interface CallState {
  status: CallStatus;
  callType: CallType;
  remoteUserId: string | null;
  remoteName: string;
  remoteAvatar?: string;
  channel: MessageChannel;
  connectedAt: number | null;
  startOutgoingCall: (payload: StartOutgoingCallPayload) => void;
  receiveIncomingCall: (payload: CallParticipant) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  markConnected: () => void;
  markDeclined: () => void;
  markEnded: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as CallStatus,
  callType: 'audio' as CallType,
  remoteUserId: null as string | null,
  remoteName: '',
  remoteAvatar: undefined as string | undefined,
  channel: 'cloud' as MessageChannel,
  connectedAt: null as number | null,
};

export const useCallStore = create<CallState>((set, get) => ({
  ...initialState,

  startOutgoingCall: (payload) => {
    set({
      status: 'outgoing',
      callType: payload.callType,
      remoteUserId: payload.remoteUserId,
      remoteName: payload.remoteName,
      remoteAvatar: payload.remoteAvatar,
      channel: payload.channel,
      connectedAt: null,
    });

    emitInviteCall({
      toUserId: payload.remoteUserId,
      callType: payload.callType,
      channel: payload.channel,
      callerName: payload.callerName,
      callerAvatar: payload.callerAvatar,
    });
  },

  receiveIncomingCall: (payload) => {
    const current = get();
    if (current.status === 'connected' || current.status === 'outgoing') {
      emitDeclineCall(payload.remoteUserId);
      return;
    }

    set({
      status: 'incoming',
      callType: payload.callType,
      remoteUserId: payload.remoteUserId,
      remoteName: payload.remoteName,
      remoteAvatar: payload.remoteAvatar,
      channel: payload.channel,
      connectedAt: null,
    });

    navigateToCall({
      receiverId: payload.remoteUserId,
      receiverName: payload.remoteName,
      receiverAvatar: payload.remoteAvatar,
      callType: payload.callType,
      channel: payload.channel,
      isIncoming: true,
    });
  },

  acceptCall: () => {
    const { remoteUserId, status } = get();
    if (!remoteUserId || status !== 'incoming') return;

    emitAcceptCall(remoteUserId);
    set({ status: 'connected', connectedAt: Date.now() });
  },

  declineCall: () => {
    const { remoteUserId } = get();
    if (remoteUserId) {
      emitDeclineCall(remoteUserId);
    }
    set({ ...initialState, status: 'declined' });
    setTimeout(() => get().reset(), 1500);
  },

  endCall: () => {
    const { remoteUserId } = get();
    if (remoteUserId) {
      emitEndCall(remoteUserId);
    }
    set({ status: 'ended', connectedAt: null });
    setTimeout(() => get().reset(), 1200);
  },

  markConnected: () => {
    set({ status: 'connected', connectedAt: Date.now() });
  },

  markDeclined: () => {
    set({ ...initialState, status: 'declined' });
    setTimeout(() => get().reset(), 1500);
  },

  markEnded: () => {
    set({ status: 'ended', connectedAt: null });
    setTimeout(() => get().reset(), 1200);
  },

  reset: () => set(initialState),
}));
