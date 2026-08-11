import React from 'react';

export const DateSeparator: React.FC<{ date: string }> = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-slate-300/40 dark:border-slate-700/50 shadow-2xs">
        {date}
      </span>
    </div>
  );
};
