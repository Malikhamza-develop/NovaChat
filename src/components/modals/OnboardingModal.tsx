import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  Zap,
  MessageSquare,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    icon: Zap,
    title: 'Real-Time Message Sync',
    description:
      'Send and receive messages instantly with live typing indicators, delivery checkmarks, and instant automated response simulation.',
    badge: 'Instant Sync',
  },
  {
    icon: MessageSquare,
    title: 'Rich Threads & Reactions',
    description:
      'Express yourself with quick emoji reactions, inline message replies, media attachment sharing, and customizable thread filters.',
    badge: 'Interactive',
  },
  {
    icon: Lock,
    title: 'Custom Themes & Archive',
    description:
      'Switch between sleek dark and light canvases, pin your priority conversations, and archive inactive threads effortlessly.',
    badge: 'Personalized',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      onClose();
    }
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Welcome to NovaChat
            </span>
          </div>
          <button
            onClick={() => {
              completeOnboarding();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <Icon className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 mb-2">
              {step.badge}
            </span>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {step.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 my-6">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-1.5 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>{currentStep === STEPS.length - 1 ? "Let's Get Started" : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
