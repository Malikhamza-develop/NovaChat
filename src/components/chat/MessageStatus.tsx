import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { MessageStatus as StatusType } from '../../types';

interface MessageStatusProps {
  status: StatusType | string;
  className?: string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'sending':
    case 'pending':
      return <Clock className={`w-3.5 h-3.5 text-slate-400 animate-spin ${className}`} />;
    case 'failed':
      return <AlertCircle className={`w-3.5 h-3.5 text-rose-500 ${className}`} />;
    case 'sent':
      return <Check className={`w-3.5 h-3.5 text-slate-300 dark:text-slate-400 ${className}`} />;
    case 'delivered':
      return <CheckCheck className={`w-3.5 h-3.5 text-slate-300 dark:text-slate-400 ${className}`} />;
    case 'read':
      return <CheckCheck className={`w-3.5 h-3.5 text-sky-400 font-bold ${className}`} />;
    default:
      return null;
  }
};
