import React, { useState } from 'react';
import { Sparkles, FileText, MessageSquare, Wand2, Languages, X, Copy, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ConversationSummary } from '../../types';
import {
  summarizeConversation,
  getAiReplySuggestions,
  rephraseDraft,
  translateText,
} from '../../services/aiService';

interface AiToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: ConversationSummary;
  messages?: Message[];
  onInsertText?: (text: string) => void;
}

export const AiToolsModal: React.FC<AiToolsModalProps> = ({
  isOpen,
  onClose,
  conversation,
  messages = [],
  onInsertText,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'replies' | 'rephrase' | 'translate'>('summary');

  // Summary state
  const [summaryText, setSummaryText] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState<boolean>(false);

  // Rephrase state
  const [draftInput, setDraftInput] = useState<string>('');
  const [rephrasedResult, setRephrasedResult] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [isRephrasing, setIsRephrasing] = useState<boolean>(false);

  // Translation state
  const [translateInput, setTranslateInput] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('Spanish');
  const [translatedResult, setTranslatedResult] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const result = await summarizeConversation(messages, conversation?.name || 'this chat');
    setSummaryText(result);
    setIsSummarizing(false);
  };

  const handleGenerateReplies = async () => {
    setIsGeneratingReplies(true);
    const results = await getAiReplySuggestions(messages, conversation?.name || 'friend');
    setSuggestions(results);
    setIsGeneratingReplies(false);
  };

  const handleRephrase = async () => {
    if (!draftInput.trim()) return;
    setIsRephrasing(true);
    const result = await rephraseDraft(draftInput, selectedTone);
    setRephrasedResult(result);
    setIsRephrasing(false);
  };

  const handleTranslate = async () => {
    if (!translateInput.trim()) return;
    setIsTranslating(true);
    const result = await translateText(translateInput, targetLang);
    setTranslatedResult(result);
    setIsTranslating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = (text: string) => {
    if (onInsertText) {
      onInsertText(text);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Nova AI Smart Suite</h3>
                <p className="text-xs text-indigo-100 opacity-90">Powered by Google Gemini 3.6</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('summary');
                if (!summaryText) handleGenerateSummary();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Summarize Thread</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('replies');
                if (suggestions.length === 0) handleGenerateReplies();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'replies'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>Quick Replies</span>
            </button>

            <button
              onClick={() => setActiveTab('rephrase')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'rephrase'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4 text-amber-500" />
              <span>Tone Polish</span>
            </button>

            <button
              onClick={() => setActiveTab('translate')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'translate'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Languages className="w-4 h-4 text-emerald-500" />
              <span>Translator</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-5 flex-1 overflow-y-auto min-h-[280px]">
            {/* TAB 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Thread Summary: {conversation?.name || 'Current Chat'}</span>
                  </h4>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {isSummarizing ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs font-medium">Gemini is analyzing chat messages...</p>
                  </div>
                ) : summaryText ? (
                  <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {summaryText}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <button
                      onClick={handleGenerateSummary}
                      className="px-4 py-2 bg-indigo-600 text-white font-medium text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
                    >
                      Generate Chat Summary
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: QUICK REPLIES */}
            {activeTab === 'replies' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    AI Suggested Quick Replies
                  </h4>
                  <button
                    onClick={handleGenerateReplies}
                    disabled={isGeneratingReplies}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingReplies ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                {isGeneratingReplies ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
                    <p className="text-xs font-medium">Generating context-aware reply options...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-2.5">
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl flex items-center justify-between gap-3 hover:border-indigo-400 transition-all group"
                      >
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {suggestion}
                        </p>
                        <button
                          onClick={() => handleInsert(suggestion)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex-shrink-0 transition-transform group-hover:scale-105"
                        >
                          Use Reply
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <button
                      onClick={handleGenerateReplies}
                      className="px-4 py-2 bg-purple-600 text-white font-medium text-xs rounded-xl shadow-md hover:bg-purple-700 transition-colors"
                    >
                      Generate Suggestions
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TONE REPHRASE */}
            {activeTab === 'rephrase' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Message Draft
                  </label>
                  <textarea
                    value={draftInput}
                    onChange={(e) => setDraftInput(e.target.value)}
                    placeholder="Type or paste your message here..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Desired Tone
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['professional', 'casual', 'friendly', 'concise', 'persuasive', 'excited'].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                          selectedTone === tone
                            ? 'bg-amber-500 text-white shadow-xs font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRephrase}
                  disabled={isRephrasing || !draftInput.trim()}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isRephrasing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  <span>Rephrase Message</span>
                </button>

                {rephrasedResult && (
                  <div className="p-3.5 bg-amber-50/50 dark:bg-slate-800 border border-amber-200/80 dark:border-amber-900/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-bold">
                      <span>Polished ({selectedTone}) Result:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(rephrasedResult)}
                          className="hover:text-indigo-600 transition-colors"
                          title="Copy text"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{rephrasedResult}</p>
                    <button
                      onClick={() => handleInsert(rephrasedResult)}
                      className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Insert into Input Field
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: TRANSLATOR */}
            {activeTab === 'translate' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Language
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {['Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Hindi', 'Arabic', 'Portuguese', 'Italian', 'Korean'].map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Text to Translate
                  </label>
                  <textarea
                    value={translateInput}
                    onChange={(e) => setTranslateInput(e.target.value)}
                    placeholder="Enter message text..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || !translateInput.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isTranslating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Languages className="w-4 h-4" />
                  )}
                  <span>Translate Text</span>
                </button>

                {translatedResult && (
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                      <span>Translation ({targetLang}):</span>
                      <button
                        onClick={() => handleCopy(translatedResult)}
                        className="hover:text-indigo-600 transition-colors"
                        title="Copy translation"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{translatedResult}</p>
                    <button
                      onClick={() => handleInsert(translatedResult)}
                      className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Insert into Input Field
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
