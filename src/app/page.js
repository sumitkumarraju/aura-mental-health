'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { getGreeting, EMOTIONS, QUICK_ACTIONS } from '@/lib/utils';
import { saveEmotion, getProfile, getSupportTasks, saveSupportTasks } from '@/lib/storage';
import {
  ChatCircleDots,
  Compass,
  Leaf,
  Ear,
  PencilSimple,
  Question,
  ArrowUpRight,
  Check,
  ArrowsClockwise,
  UsersThree,
  MusicNote,
  PersonSimpleWalk,
  Sparkle,
} from '@phosphor-icons/react';

const ACTION_ICONS = {
  talk: ChatCircleDots,
  understand: Compass,
  calm: Leaf,
  listen: Ear,
  thoughts: PencilSimple,
  unsure: Question,
};

const SUPPORT_ICONS = {
  chat: ChatCircleDots,
  pencil: PencilSimple,
  users: UsersThree,
  music: MusicNote,
  compass: Compass,
  walk: PersonSimpleWalk,
};

const DEFAULT_SUPPORT_ACTIONS = [
  {
    id: 'music_safety',
    icon: 'music',
    category: 'Comfort',
    title: 'Listen to something that makes you feel safe.',
    description: 'Put on a familiar album or soothing soundscape without rushing.',
    time: '10 min',
    reason: 'You mentioned yesterday that music helps when you’re overwhelmed.',
    href: '/calm',
    color: '#14B8A6',
  },
  {
    id: 'express_thoughts',
    icon: 'pencil',
    category: 'Express',
    title: 'Write down what’s been occupying your mind.',
    description: 'Empty your thoughts into a private journal entry with zero pressure.',
    time: '5 min',
    reason: 'Writing helps create distance from recurring thought loops.',
    href: '/journal',
    color: '#8B5CF6',
  },
  {
    id: 'mindful_walk',
    icon: 'walk',
    category: 'Move',
    title: 'Take a short mindful walk.',
    description: 'Step outside or around the room. Feel your feet making contact with the ground.',
    time: '8 min',
    reason: 'Gentle physical movement helps reset accumulated sensory stress.',
    color: '#F59E0B',
  },
];

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export default function HomePage() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [freeText, setFreeText] = useState('');
  const [userName, setUserName] = useState('');
  const [showFreeText, setShowFreeText] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);
  const [supportActions, setSupportActions] = useState([]);
  const [completedSupport, setCompletedSupport] = useState(new Set());

  useEffect(() => {
    const profile = getProfile();
    if (profile?.name) setUserName(profile.name);

    const saved = getSupportTasks();
    if (saved?.tasks?.length > 0) {
      setSupportActions(saved.tasks.slice(0, 3));
      setCompletedSupport(new Set(saved.completed || []));
    } else {
      setSupportActions(DEFAULT_SUPPORT_ACTIONS);
    }
  }, []);

  const handleEmotionSelect = (emotionId) => {
    setSelectedEmotion(emotionId);
    saveEmotion({ emotion: emotionId });
    setCheckinDone(true);
    setTimeout(() => setCheckinDone(false), 3000);
  };

  const handleFreeTextSubmit = () => {
    if (freeText.trim()) {
      saveEmotion({ emotion: 'custom', text: freeText.trim() });
      setFreeText('');
      setShowFreeText(false);
      setCheckinDone(true);
      setTimeout(() => setCheckinDone(false), 3000);
    }
  };

  const handleDontKnow = () => {
    setSelectedEmotion('dont_know');
    saveEmotion({ emotion: "I don't know", note: "User wasn't sure what they were feeling" });
    setCheckinDone(true);
    setTimeout(() => setCheckinDone(false), 3000);
  };

  const handleCompleteSupport = (id) => {
    const updated = new Set(completedSupport);
    updated.add(id);
    setCompletedSupport(updated);
    saveSupportTasks({
      date: new Date().toDateString(),
      tasks: supportActions,
      completed: Array.from(updated),
    });
  };

  return (
    <div className="page-container">
      <motion.div variants={containerVars} initial="hidden" animate="show">
        
        {/* Cinematic Hero Section */}
        <motion.section variants={itemVars} style={{ position: 'relative', marginBottom: 'var(--space-8)', padding: 'var(--space-8) var(--space-6)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Background Abstract Image */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Image
              src="/images/calm_aura_wave.jpg"
              alt="Calm abstract wave"
              fill
              style={{ objectFit: 'cover', opacity: 0.4, mixBlendMode: 'screen' }}
              priority
            />
            {/* Gradient Overlay for Text Readability */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0.2) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 100%)' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.h1 
              className="display-text" 
              style={{ marginBottom: 'var(--space-2)', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {getGreeting()}{userName ? <span style={{ opacity: 0.7 }}>, {userName}.</span> : <span style={{ opacity: 0.7 }}>.</span>}
            </motion.h1>
            <motion.p
              style={{
                fontSize: 'var(--text-xl)',
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '560px',
                fontWeight: 300,
                lineHeight: 1.6,
                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              You don’t have to figure everything out today. Take things one breath at a time.
            </motion.p>
          </div>
        </motion.section>

        {/* Emotional Check-in: "What’s taking up space in your mind today?" */}
        <motion.section variants={itemVars} className="glass-panel" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <span className="label-text" style={{ color: 'var(--accent-teal)' }}>DAILY CHECK-IN</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 300, marginTop: 4 }}>
                What’s taking up space in your mind today?
              </h2>
            </div>
            {checkinDone && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ color: 'var(--accent-green)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Check size={16} /> AURA has noted this
              </motion.span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {EMOTIONS.map((emotion) => {
              const isSelected = selectedEmotion === emotion.id;
              return (
                <motion.button
                  key={emotion.id}
                  onClick={() => handleEmotionSelect(emotion.id)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {emotion.label}
                </motion.button>
              );
            })}

            {/* "I don't know" button */}
            <motion.button
              onClick={handleDontKnow}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: selectedEmotion === 'dont_know' ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: `1px dashed ${selectedEmotion === 'dont_know' ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
                color: selectedEmotion === 'dont_know' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              I don’t know
            </motion.button>

            {/* Type Freely Toggle */}
            <motion.button
              onClick={() => setShowFreeText(!showFreeText)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: showFreeText ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${showFreeText ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
                color: showFreeText ? 'var(--text-primary)' : 'var(--text-tertiary)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              <PencilSimple size={14} style={{ marginRight: 4 }} /> Type freely
            </motion.button>
          </div>

          {/* Free Text Input */}
          <AnimatePresence>
            {showFreeText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Describe what you’re carrying right now..."
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFreeTextSubmit()}
                    autoFocus
                    style={{ borderRadius: 'var(--radius-full)' }}
                  />
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleFreeTextSubmit}
                    disabled={!freeText.trim()}
                  >
                    Share
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Today's Support: 1-3 Personalized Actions with "Why it was suggested" */}
        <motion.section variants={itemVars} style={{ position: 'relative', marginBottom: 'var(--space-8)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Image
              src="/images/support_light_leaks.jpg"
              alt="Support light leaks"
              fill
              style={{ objectFit: 'cover', opacity: 0.2, mixBlendMode: 'screen' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.7) 0%, rgba(5,5,5,1) 100%)' }} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <span className="label-text" style={{ color: 'var(--accent-warm)', textShadow: '0 2px 10px rgba(245, 158, 11, 0.2)' }}>TODAY’S SUPPORT</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 300, marginTop: 4 }}>
                For you today
              </h2>
            </div>
            <Link href="/support" className="label-text" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              VIEW ALL <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="bento-grid" style={{ marginTop: 0 }}>
            {supportActions.map((action) => {
              const Icon = SUPPORT_ICONS[action.icon] || Compass;
              const isDone = completedSupport.has(action.id);

              return (
                <div key={action.id} className="bento-item-third">
                  <div
                    className="glass-panel"
                    style={{
                      padding: 'var(--space-6)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      background: isDone ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-surface)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, color-mix(in srgb, ${action.color} 20%, transparent), transparent)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: action.color,
                          }}
                        >
                          <Icon size={22} weight="thin" />
                        </div>
                        <span className="label-text" style={{ color: 'var(--text-tertiary)' }}>{action.time}</span>
                      </div>

                      <span className="label-text" style={{ color: action.color, display: 'block', marginBottom: 4 }}>
                        {action.category}
                      </span>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                        {action.title}
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)', fontWeight: 300 }}>
                        {action.description}
                      </p>

                      {/* Why it was suggested */}
                      {action.reason && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: 'var(--space-4)' }}>
                          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            &ldquo;{action.reason}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                      {action.href ? (
                        <Link href={action.href} className="btn btn--glass" style={{ flex: 1, fontSize: 'var(--text-xs)', padding: '6px 12px' }}>
                          Open
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn--primary btn--glass"
                        onClick={() => handleCompleteSupport(action.id)}
                        disabled={isDone}
                        style={{ flex: 1, fontSize: 'var(--text-xs)', padding: '6px 12px' }}
                      >
                        {isDone ? <><Check size={14} /> Done</> : 'Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Quick Actions Bento Grid */}
        <motion.section variants={itemVars}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <span className="label-text" style={{ color: 'var(--accent-calm)' }}>EXPLORE</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 300, marginTop: 4 }}>
                What might help?
              </h2>
            </div>
          </div>

          <div className="bento-grid" style={{ marginTop: 0 }}>
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = ACTION_ICONS[action.id] || Question;
              const bentoClass = i === 0 ? 'bento-item-two-thirds' : i === 1 ? 'bento-item-third' : 'bento-item-half';

              return (
                <div key={action.id} className={bentoClass}>
                  <Link href={action.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    <motion.div
                      className="glass-panel"
                      style={{ padding: 'var(--space-5)', height: '100%', display: 'flex', flexDirection: 'column' }}
                      whileHover="hover"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, color-mix(in srgb, ${action.color} 20%, transparent) 0%, transparent 100%)`,
                            border: `1px solid color-mix(in srgb, ${action.color} 30%, transparent)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: action.color,
                          }}
                        >
                          <Icon size={24} weight="light" />
                        </div>
                        <motion.div variants={{ hover: { x: 4, y: -4, opacity: 1 } }} initial={{ opacity: 0.5 }}>
                          <ArrowUpRight size={20} style={{ color: 'var(--text-tertiary)' }} />
                        </motion.div>
                      </div>

                      <div style={{ marginTop: 'auto' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                          {action.label}
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 300 }}>
                          {action.description}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
