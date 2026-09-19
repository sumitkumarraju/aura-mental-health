'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupportTasks, saveSupportTasks } from '@/lib/storage';
import {
  ChatCircleDots,
  PencilSimple,
  UsersThree,
  MusicNote,
  Compass,
  PersonSimpleWalk,
  Check,
  ArrowsClockwise,
  X,
  Sparkle,
  Leaf,
} from '@phosphor-icons/react';

// Pool covering all 7 spec categories: Connect, Express, Reflect, Ground, Calm, Move, Comfort
const ALL_SUPPORT_ACTIONS = [
  {
    id: 'connect_trust',
    category: 'Connect',
    title: 'Talk to someone you trust.',
    description: 'Reach out with a short message or call to someone who makes you feel safe.',
    time: '15 min',
    reason: 'Meaningful conversations are marked in your profile as bringing deep comfort.',
    icon: 'users',
    color: '#F59E0B',
  },
  {
    id: 'express_writing',
    category: 'Express',
    title: 'Write down what’s been occupying your mind.',
    description: 'Put your thoughts on the page without judging grammar, coherence, or logic.',
    time: '5 min',
    reason: 'Expressing thoughts outwardly helps decompress cognitive overload.',
    icon: 'pencil',
    href: '/journal',
    color: '#8B5CF6',
  },
  {
    id: 'reflect_loop',
    category: 'Reflect',
    title: 'Explore a recurring thought.',
    description: 'Notice what your mind returns to, and ask yourself what it might be trying to protect.',
    time: '7 min',
    reason: 'A pattern you may want to notice: recurring thoughts often point to an unspoken need.',
    icon: 'chat',
    href: '/chat',
    color: '#BB9AF7',
  },
  {
    id: 'ground_sensory',
    category: 'Ground',
    title: 'Try a 5-4-3-2-1 grounding exercise.',
    description: 'Re-orient your nervous system by naming sensations in your immediate environment.',
    time: '3 min',
    reason: 'Sensory anchoring brings attention back from future worries to physical safety.',
    icon: 'compass',
    href: '/calm',
    color: '#10B981',
  },
  {
    id: 'calm_breathing',
    category: 'Calm',
    title: 'Take four cycles of box breathing.',
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Let your shoulders drop.',
    time: '2 min',
    reason: 'Rhythmic breathwork activates the parasympathetic rest response.',
    icon: 'leaf',
    href: '/calm',
    color: '#14B8A6',
  },
  {
    id: 'move_walk',
    category: 'Move',
    title: 'Take a short mindful walk.',
    description: 'Step outside or gently walk around the room. Feel gravity and movement.',
    time: '10 min',
    reason: 'Light movement helps discharge stored adrenaline from tension.',
    icon: 'walk',
    color: '#F59E0B',
  },
  {
    id: 'comfort_music',
    category: 'Comfort',
    title: 'Listen to something that makes you feel safe.',
    description: 'Immerse yourself in a familiar soundscape or album without distraction.',
    time: '10 min',
    reason: 'You mentioned yesterday that music helps when you’re overwhelmed.',
    icon: 'music',
    href: '/calm',
    color: '#14B8A6',
  },
];

const ICONS = {
  chat: ChatCircleDots,
  pencil: PencilSimple,
  users: UsersThree,
  music: MusicNote,
  compass: Compass,
  walk: PersonSimpleWalk,
  leaf: Leaf,
};

export default function SupportPage() {
  const [tasks, setTasks] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [skippedIds, setSkippedIds] = useState(new Set());

  useEffect(() => {
    const saved = getSupportTasks();
    const todayStr = new Date().toDateString();

    if (saved?.date === todayStr && saved?.tasks?.length > 0) {
      setTasks(saved.tasks);
      setCompletedIds(new Set(saved.completed || []));
      setSkippedIds(new Set(saved.skipped || []));
    } else {
      // Pick 3 diverse items
      const initial = [ALL_SUPPORT_ACTIONS[0], ALL_SUPPORT_ACTIONS[1], ALL_SUPPORT_ACTIONS[6]];
      setTasks(initial);
      saveSupportTasks({
        date: todayStr,
        tasks: initial,
        completed: [],
        skipped: [],
      });
    }
  }, []);

  const handleComplete = (id) => {
    const newCompleted = new Set(completedIds);
    newCompleted.add(id);
    setCompletedIds(newCompleted);

    saveSupportTasks({
      date: new Date().toDateString(),
      tasks,
      completed: Array.from(newCompleted),
      skipped: Array.from(skippedIds),
    });
  };

  const handleSkip = (id) => {
    // Skipping is completely judgment-free
    const newSkipped = new Set(skippedIds);
    newSkipped.add(id);
    setSkippedIds(newSkipped);

    saveSupportTasks({
      date: new Date().toDateString(),
      tasks,
      completed: Array.from(completedIds),
      skipped: Array.from(newSkipped),
    });
  };

  const handleReplace = (id) => {
    const currentIds = new Set(tasks.map((t) => t.id));
    const available = ALL_SUPPORT_ACTIONS.filter((t) => !currentIds.has(t.id));

    if (available.length > 0) {
      const replacement = available[Math.floor(Math.random() * available.length)];
      const updated = tasks.map((t) => (t.id === id ? replacement : t));
      setTasks(updated);

      // Remove from completed/skipped if replacing
      const newCompleted = new Set(completedIds);
      newCompleted.delete(id);
      setCompletedIds(newCompleted);

      const newSkipped = new Set(skippedIds);
      newSkipped.delete(id);
      setSkippedIds(newSkipped);

      saveSupportTasks({
        date: new Date().toDateString(),
        tasks: updated,
        completed: Array.from(newCompleted),
        skipped: Array.from(newSkipped),
      });
    }
  };

  const activeCount = tasks.filter((t) => !completedIds.has(t.id) && !skippedIds.has(t.id)).length;
  const allResolved = tasks.length > 0 && activeCount === 0;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        
        {/* Header with Focus Orb */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-8)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '400px', height: '400px', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
            <Image
              src="/images/focus_glass_orb.jpg"
              alt="Focus Orb"
              fill
              style={{ objectFit: 'contain', mixBlendMode: 'screen', filter: 'blur(10px)' }}
            />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="label-text" style={{ color: 'var(--accent-warm)' }}>PERSONALIZED SUPPORT</span>
            <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)', marginTop: 'var(--space-2)' }}>
              For you today
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', fontWeight: 300, marginTop: 'var(--space-2)', maxWidth: 580 }}>
              Small, supportive steps tailored to what you’ve shared. Choose only what feels manageable. You can skip or replace anything without judgment.
            </p>
          </div>
        </div>

        {/* Actions List */}
        <div className="bento-grid" style={{ marginTop: 0 }}>
          <AnimatePresence>
            {tasks.map((task, i) => {
              const Icon = ICONS[task.icon] || Compass;
              const isCompleted = completedIds.has(task.id);
              const isSkipped = skippedIds.has(task.id);

              return (
                <motion.div
                  key={task.id}
                  className="bento-item-full glass-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isSkipped ? 0.35 : 1,
                    y: 0,
                    filter: isSkipped ? 'grayscale(0.7)' : 'none',
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    padding: 'var(--space-6)',
                    position: 'relative',
                    border: isCompleted
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : isSkipped
                      ? '1px dashed var(--border-subtle)'
                      : '1px solid var(--border-subtle)',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-surface)',
                  }}
                >
                  {/* Status Badges */}
                  {isCompleted && (
                    <div style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={18} weight="bold" />
                      <span className="label-text" style={{ color: 'var(--accent-green)' }}>COMPLETED</span>
                    </div>
                  )}

                  {isSkipped && (
                    <div style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="label-text" style={{ color: 'var(--text-tertiary)' }}>SKIPPED • NO PRESSURE</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, color-mix(in srgb, ${task.color} 20%, transparent), transparent)`,
                        border: `1px solid color-mix(in srgb, ${task.color} 30%, transparent)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: task.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={28} weight="thin" />
                    </div>

                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                        <span className="label-text" style={{ color: task.color }}>{task.category}</span>
                        <span style={{ color: 'var(--border-subtle)' }}>•</span>
                        <span className="label-text" style={{ color: 'var(--text-tertiary)' }}>{task.time}</span>
                      </div>

                      <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 300, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                        {task.title}
                      </h3>

                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                        {task.description}
                      </p>

                      {/* Why it was selected */}
                      {task.reason && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-5)', maxWidth: 640 }}>
                          <span className="label-text" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 2 }}>
                            WHY THIS WAS SUGGESTED
                          </span>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            &ldquo;{task.reason}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Controls: Complete, Skip, Replace */}
                      {!isCompleted && !isSkipped && (
                        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                          {task.href ? (
                            <Link href={task.href} className="btn btn--primary btn--glass">
                              Let’s do it
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className="btn btn--glass"
                            onClick={() => handleComplete(task.id)}
                          >
                            <Check size={16} /> Complete
                          </button>
                          <button
                            type="button"
                            className="btn btn--glass"
                            onClick={() => handleSkip(task.id)}
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            Skip
                          </button>
                          <button
                            type="button"
                            className="btn btn--glass"
                            onClick={() => handleReplace(task.id)}
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <ArrowsClockwise size={16} /> Replace
                          </button>
                        </div>
                      )}

                      {(isCompleted || isSkipped) && (
                        <button
                          type="button"
                          className="btn btn--glass"
                          onClick={() => handleReplace(task.id)}
                          style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
                        >
                          <ArrowsClockwise size={14} /> Try another step
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Peaceful Closing State */}
        {allResolved && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginTop: 'var(--space-8)', padding: 'var(--space-8)' }}
          >
            <Sparkle size={36} style={{ color: 'var(--accent-teal)', margin: '0 auto var(--space-3)' }} />
            <h3 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>
              No pressure. Choose something that feels manageable.
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 300 }}>
              You’ve reviewed today’s support. You are allowed to rest now.
            </p>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
