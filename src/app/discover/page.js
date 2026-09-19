'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  Sparkle,
  Check,
  ArrowsClockwise,
  PencilSimple,
  ChatCircleDots,
  Heart,
  HandHeart,
  Compass,
} from '@phosphor-icons/react';
import { saveEmotion, saveProfile, getProfile } from '@/lib/storage';

const DISCOVERY_QUESTIONS = [
  {
    id: 'space',
    question: "What has been taking up the most space in your mind?",
    type: 'text_or_options',
    options: [
      "A relationship or conversation that's lingering",
      "Work, pressure, or expectations",
      "Uncertainty about tomorrow or the future",
      "Feeling disconnected or isolated",
      "A physical heaviness or exhaustion",
      "I can't pinpoint it—it just feels full",
    ],
  },
  {
    id: 'when',
    question: "When did you start feeling this way?",
    type: 'options',
    options: [
      "Just now",
      "Earlier today",
      "A few days ago",
      "It has been building for a while",
      "I'm not quite sure",
    ],
  },
  {
    id: 'feels_like',
    question: "Does this feel more like fear, sadness, loneliness, anger, or something else?",
    type: 'options',
    options: [
      "Fear or anxiety",
      "Sadness or grief",
      "Loneliness or feeling unseen",
      "Frustration or anger",
      "Emptiness or numbness",
      "Overwhelmed by everything at once",
    ],
  },
  {
    id: 'returning_to',
    question: "What does your mind keep returning to?",
    type: 'text_or_options',
    options: [
      "Things I wish I had said or done differently",
      "What if things don't work out?",
      "Feeling like I have to handle it all alone",
      "Replaying a specific moment or message",
      "Nothing in particular—just a persistent fog",
    ],
  },
  {
    id: 'wish_someone_did',
    question: "When you feel like this, what do you wish someone would do?",
    type: 'options',
    options: [
      "Just listen without trying to fix it",
      "Simply stay with me without asking questions",
      "Help me untangle what I'm thinking",
      "Remind me that I'm safe and okay",
      "Give me quiet space without pressure",
    ],
  },
  {
    id: 'preference',
    question: "Would you rather talk, reflect, distract yourself, or simply have someone stay with you?",
    type: 'options',
    options: [
      "Talk it through gently",
      "Reflect quietly on my own",
      "A gentle distraction or sound",
      "Simply have someone stay with me",
    ],
  },
  {
    id: 'lighter',
    question: "What usually makes things feel a little lighter?",
    type: 'options',
    options: [
      "Music that feels familiar",
      "A walk or stepping outside",
      "Writing whatever comes out",
      "Hearing a friendly voice",
      "Deep quiet and rest",
    ],
  },
];

export default function DiscoverPage() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [customText, setCustomText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'right' | 'correcting' | 'corrected'
  const [corrections, setCorrections] = useState({
    feeling: '',
    connected: '',
    need: '',
    help: '',
  });

  const isIntro = currentStep === -1;
  const currentQ = DISCOVERY_QUESTIONS[currentStep];

  const handleSelect = (val) => {
    const updated = { ...answers, [currentQ.id]: val };
    setAnswers(updated);
    setCustomText('');

    if (currentStep < DISCOVERY_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
      deriveAnalysis(updated);
    }
  };

  const deriveAnalysis = (ans) => {
    // Intelligent emotional inference based on answers
    let feeling = "Anxiety + loneliness";
    let connected = "Fear of losing an important connection";
    let need = "Someone to listen without judgment";
    let help = "Connection + safe expression";

    if (ans.feels_like?.includes('Sadness')) {
      feeling = "Sadness + quiet grief";
      connected = "Processing a loss or heavy memory";
      need = "Gentle compassion and space to feel";
      help = "Comforting music + unhurried quiet";
    } else if (ans.feels_like?.includes('Overwhelmed')) {
      feeling = "Overwhelm + cognitive exhaustion";
      connected = "Carrying too many expectations at once";
      need = "Permission to pause and step back";
      help = "Sensory grounding + breath regulation";
    } else if (ans.feels_like?.includes('Frustration')) {
      feeling = "Frustration + unmet needs";
      connected = "Feeling unheard or blocked by circumstances";
      need = "Validation of your boundaries";
      help = "Expressive journaling + physical movement";
    } else if (ans.feels_like?.includes('Emptiness')) {
      feeling = "Emotional numbness + burnout";
      connected = "Nervous system in protective shutdown";
      need = "Gentle warmth without demands";
      help = "Low-stimulation rest + familiar comforts";
    }

    if (ans.wish_someone_did) {
      need = ans.wish_someone_did;
    }
    if (ans.lighter) {
      help = `${ans.lighter} + gentle pacing`;
    }

    setCorrections({ feeling, connected, need, help });
  };

  const handleConfirmRight = () => {
    setFeedback('right');
    // Save to emotional profile
    saveEmotion({
      emotion: corrections.feeling,
      context: corrections.connected,
      need: corrections.need,
      source: 'discovery',
    });
  };

  const handleSaveCorrection = () => {
    setFeedback('corrected');
    saveEmotion({
      emotion: corrections.feeling,
      context: corrections.connected,
      need: corrections.need,
      source: 'discovery_corrected',
    });
  };

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - var(--space-8)*2)' }}>
      <AnimatePresence mode="wait">
        
        {/* Intro */}
        {isIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', maxWidth: 640 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              style={{
                width: 80,
                height: 80,
                margin: '0 auto var(--space-6)',
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, var(--bg-deep) 0%, var(--accent-calm) 50%, var(--accent-teal) 80%, var(--bg-deep) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
              }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkle size={32} weight="thin" style={{ color: 'var(--accent-calm)' }} />
              </div>
            </motion.div>
            
            <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)' }}>
              Understand My Feelings
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', fontWeight: 300, marginBottom: 'var(--space-8)', lineHeight: 1.6 }}>
              You don’t have to know exactly what you’re feeling. Let’s figure it out together.
            </p>
            <button
              className="btn btn--primary btn--glass"
              onClick={() => setCurrentStep(0)}
              style={{ padding: 'var(--space-4) var(--space-7)', fontSize: 'var(--text-base)' }}
            >
              Let’s figure it out <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Guided Conversational Questions */}
        {!isIntro && !showResult && currentQ && (
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%', maxWidth: 680 }}
          >
            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-8)' }}>
              {DISCOVERY_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 2,
                    flex: 1,
                    background: i <= currentStep ? 'var(--text-primary)' : 'var(--border-subtle)',
                    borderRadius: 2,
                    transition: 'background 0.4s ease',
                  }}
                />
              ))}
            </div>

            <span className="label-text" style={{ color: 'var(--accent-calm)', display: 'block', marginBottom: 'var(--space-2)' }}>
              QUESTION {currentStep + 1} OF {DISCOVERY_QUESTIONS.length}
            </span>

            <h2 className="display-text" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)', lineHeight: 1.3 }}>
              {currentQ.question}
            </h2>

            {/* Options list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              {currentQ.options.map((opt, i) => (
                <motion.button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="glass-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    textAlign: 'left',
                    padding: 'var(--space-4) var(--space-5)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 300,
                  }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>

            {/* Free text option for text_or_options */}
            {currentQ.type === 'text_or_options' && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Or write in your own words:</p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Describe it here..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && customText.trim() && handleSelect(customText.trim())}
                  />
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={!customText.trim()}
                    onClick={() => handleSelect(customText.trim())}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {currentStep > 0 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <button
                  type="button"
                  className="btn btn--glass"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Result: What AURA Understood */}
        {showResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: 740 }}
          >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <span className="label-text" style={{ color: 'var(--accent-teal)' }}>SYNTHESIS</span>
              <h1 className="display-text" style={{ fontSize: 'var(--text-4xl)', marginTop: 'var(--space-2)' }}>
                What AURA understood
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', fontWeight: 300, marginTop: 'var(--space-2)' }}>
                Based on your reflections. You are always the expert on your own feelings.
              </p>
            </div>

            {/* Bento Card of Understanding */}
            <div className="glass-panel" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-6)' }}>
              <div className="bento-grid" style={{ marginTop: 0, gap: 'var(--space-5)' }}>
                
                {/* 1. You may be feeling */}
                <div className="bento-item-half" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
                  <span className="label-text" style={{ color: 'var(--accent-calm)', display: 'block', marginBottom: 6 }}>
                    YOU MAY BE FEELING
                  </span>
                  {feedback === 'correcting' ? (
                    <input
                      type="text"
                      className="input-glass"
                      value={corrections.feeling}
                      onChange={(e) => setCorrections({ ...corrections, feeling: e.target.value })}
                      style={{ fontSize: 'var(--text-lg)' }}
                    />
                  ) : (
                    <p style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-primary)' }}>
                      {corrections.feeling}
                    </p>
                  )}
                </div>

                {/* 2. What seems connected to it */}
                <div className="bento-item-half" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
                  <span className="label-text" style={{ color: 'var(--accent-warm)', display: 'block', marginBottom: 6 }}>
                    WHAT SEEMS CONNECTED TO IT
                  </span>
                  {feedback === 'correcting' ? (
                    <input
                      type="text"
                      className="input-glass"
                      value={corrections.connected}
                      onChange={(e) => setCorrections({ ...corrections, connected: e.target.value })}
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  ) : (
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {corrections.connected}
                    </p>
                  )}
                </div>

                {/* 3. What you may need right now */}
                <div className="bento-item-half">
                  <span className="label-text" style={{ color: 'var(--accent-rose)', display: 'block', marginBottom: 6 }}>
                    WHAT YOU MAY NEED RIGHT NOW
                  </span>
                  {feedback === 'correcting' ? (
                    <input
                      type="text"
                      className="input-glass"
                      value={corrections.need}
                      onChange={(e) => setCorrections({ ...corrections, need: e.target.value })}
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  ) : (
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {corrections.need}
                    </p>
                  )}
                </div>

                {/* 4. What might help */}
                <div className="bento-item-half">
                  <span className="label-text" style={{ color: 'var(--accent-green)', display: 'block', marginBottom: 6 }}>
                    WHAT MIGHT HELP
                  </span>
                  {feedback === 'correcting' ? (
                    <input
                      type="text"
                      className="input-glass"
                      value={corrections.help}
                      onChange={(e) => setCorrections({ ...corrections, help: e.target.value })}
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  ) : (
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {corrections.help}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Validation & Feedback Buttons */}
            {feedback === null && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
                <button
                  type="button"
                  className="btn btn--primary btn--glass"
                  onClick={handleConfirmRight}
                  style={{ padding: 'var(--space-3) var(--space-6)' }}
                >
                  <Check size={18} /> That’s right
                </button>
                <button
                  type="button"
                  className="btn btn--glass"
                  onClick={() => setFeedback('correcting')}
                  style={{ padding: 'var(--space-3) var(--space-6)' }}
                >
                  <PencilSimple size={18} /> That’s not quite right
                </button>
              </div>
            )}

            {feedback === 'correcting' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  Feel free to edit any of the fields above so they match what feels true to you.
                </p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleSaveCorrection}
                  style={{ padding: 'var(--space-3) var(--space-6)' }}
                >
                  <Check size={18} /> Update AURA’s Understanding
                </button>
              </div>
            )}

            {(feedback === 'right' || feedback === 'corrected') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center' }}
              >
                <p style={{ color: 'var(--accent-green)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                  ✓ {feedback === 'right' ? 'Confirmed. AURA has noted what helps you.' : 'Updated. Thank you for teaching AURA what fits you.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <Link href="/chat" className="btn btn--primary btn--glass">
                    <ChatCircleDots size={18} /> Talk about this with AURA
                  </Link>
                  <Link href="/support" className="btn btn--glass">
                    <Compass size={18} /> View Today’s Support
                  </Link>
                  <Link href="/journal" className="btn btn--glass">
                    <PencilSimple size={18} /> Reflect in Journal
                  </Link>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
