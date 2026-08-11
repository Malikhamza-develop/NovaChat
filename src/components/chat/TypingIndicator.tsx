import React from 'react';
import { motion } from 'motion/react';

export const TypingIndicator: React.FC<{ name?: string }> = ({ name }) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-4 py-2.5 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">
          {name ? `${name} is typing` : 'Typing'}
        </span>
        <div className="flex items-center gap-1">
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
          />
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
          />
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
