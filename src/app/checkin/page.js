'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { saveCheckin } from '@/lib/storage';
import { Check, SmileyMeh, Smiley, SmileySad, SmileyAngry } from '@phosphor-icons/react';

const MOOD_LABELS = ['Terrible', 'Bad', 'Low', 'Meh', 'Okay', 'Good', 'Great'];

const OPTIONAL_FIELDS = [
  { id: 'anxiety', label: 'Anxiety', low: 'Calm', high: 'Intense' },
  { id: 'energy', label: 'Energy', low: 'Drained', high: 'Energized' },
  { id: 'sleep', label: 'Sleep Quality', low: 'Poor', high: 'Great' },
  { id: 'stress', label: 'Stress', low: 'Relaxed', high: 'Very stressed' },
];

export default function CheckinPage() {
  const [mood, setMood] = useState(3);
  const [optionals, setOptionals] = useState({});
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showOptionals, setShowOptionals] = useState(false);

  const handleSubmit = () => {
    saveCheckin({
      mood,
      ...optionals,
      note: note.trim() || undefined,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - var(--space-8)*2)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-green-dim)', margin: '0 auto var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={40} style={{ color: 'var(--accent-green)' }} />
          </div>
          <h2 className="display-text" style={{ fontSize: 'var(--text-4xl)' }}>Check-in saved</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>Thank you for showing up today.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'center' }}>
            <a href="/" className="btn btn--glass">Back to home</a>
            <a href="/journey" className="btn btn--primary btn--glass">View journey</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          How are you feeling?
        </h1>

        <div className="glass-panel" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <motion.div 
            key={mood}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}
          >
            {mood <= 1 ? <SmileyAngry weight="thin" style={{ color: 'var(--accent-rose)' }} />
              : mood <= 2 ? <SmileySad weight="thin" style={{ color: 'var(--accent-warm)' }} />
              : mood <= 4 ? <SmileyMeh weight="thin" style={{ color: 'var(--text-secondary)' }} />
              : mood <= 5 ? <Smiley weight="thin" style={{ color: 'var(--accent-green)' }} />
              : <Smiley weight="thin" style={{ color: 'var(--accent-teal)' }} />}
          </motion.div>
          <p style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>
            {MOOD_LABELS[mood]}
          </p>
          <input
            type="range"
            min="0"
            max="6"
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--text-primary)' }}
          />
        </div>

        <button className="btn btn--glass" style={{ width: '100%', marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }} onClick={() => setShowOptionals(!showOptionals)}>
          {showOptionals ? 'Less detail' : 'Share more (optional)'}
        </button>

        {showOptionals && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              {OPTIONAL_FIELDS.map((field) => (
                <div key={field.id} className="glass-panel" style={{ padding: 'var(--space-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <label className="label-text">{field.label}</label>
                    <span className="label-text">{optionals[field.id] !== undefined ? `${optionals[field.id]}/10` : '—'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={optionals[field.id] ?? 5}
                    onChange={(e) => setOptionals({ ...optionals, [field.id]: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--text-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    <span>{field.low}</span>
                    <span>{field.high}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>What's really going on? (optional)</label>
          <textarea
            className="input-glass"
            placeholder="Whatever comes to mind..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            style={{ borderRadius: 'var(--radius-lg)' }}
          />
        </div>

        <button className="btn btn--primary btn--glass" style={{ width: '100%', padding: 'var(--space-4)', fontSize: 'var(--text-lg)' }} onClick={handleSubmit}>
          Save Check-in
        </button>
      </motion.div>
    </div>
  );
}
