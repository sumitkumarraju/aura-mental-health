'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getProfile,
  saveProfile,
  clearAllData,
  getJournalEntries,
  getCheckins,
  getChatHistory,
} from '@/lib/storage';
import {
  User,
  ShieldCheck,
  Trash,
  LockKey,
  Heart,
  Plus,
  X,
  Check,
  Bell,
  SlidersHorizontal,
  Info,
} from '@phosphor-icons/react';

const DEFAULT_PROFILE = {
  name: 'Sumit',
  email: '',
  communicationStyle: 'gentle',
  supportStyle: 'listen',
  whatHelps: ['Music', 'Talking to someone I trust', 'Writing', 'Nature walks', 'Being around friends'],
  whenOverwhelmed: ['I prefer someone to listen before giving advice', 'Quiet environments help me reset'],
  comforts: ['Familiar acoustic music', 'Close friends', 'Journaling'],
  doesntHelp: ['Generic motivational advice', 'Being told to just cheer up'],
  connected: ['Meaningful, honest conversations', 'Shared silence without pressure'],
  reminders: {
    checkin: true,
    journal: false,
    support: true,
    reflection: false,
  },
};

function TagSection({ title, subtitle, items, onAdd, onRemove, placeholder, accentColor }) {
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
      setIsAdding(false);
    }
  };

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 400, color: 'var(--text-primary)' }}>{title}</h3>
        <span className="label-text" style={{ color: accentColor || 'var(--text-secondary)' }}>
          {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
        </span>
      </div>
      {subtitle && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
          {subtitle}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.span
              key={`${item}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 300,
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                }}
                title="Remove item"
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {isAdding ? (
          <div style={{ display: 'inline-flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <input
              type="text"
              className="input-glass"
              placeholder={placeholder || 'Add an item...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              style={{
                padding: '4px 12px',
                height: 32,
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-full)',
                width: 220,
              }}
            />
            <button type="button" className="btn btn--primary" onClick={handleAdd} style={{ padding: '4px 12px', height: 32, fontSize: 'var(--text-xs)' }}>
              Add
            </button>
            <button type="button" className="btn btn--glass" onClick={() => setIsAdding(false)} style={{ padding: '4px 8px', height: 32, fontSize: 'var(--text-xs)' }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--glass"
            onClick={() => setIsAdding(true)}
            style={{
              padding: '4px 12px',
              fontSize: 'var(--text-xs)',
              borderStyle: 'dashed',
              color: 'var(--text-secondary)',
            }}
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [stats, setStats] = useState({ journals: 0, checkins: 0, chats: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = getProfile();
    if (savedProfile && Object.keys(savedProfile).length > 0) {
      setProfile({ ...DEFAULT_PROFILE, ...savedProfile });
    }
    setStats({
      journals: getJournalEntries().length,
      checkins: getCheckins().length,
      chats: getChatHistory().length,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleReminderToggle = (key) => {
    setProfile((prev) => ({
      ...prev,
      reminders: { ...prev.reminders, [key]: !prev.reminders?.[key] },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddTag = (category, item) => {
    const current = profile[category] || [];
    const updated = { ...profile, [category]: [...current, item] };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleRemoveTag = (category, index) => {
    const current = profile[category] || [];
    const updated = { ...profile, [category]: current.filter((_, i) => i !== index) };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleDeleteData = () => {
    clearAllData();
    window.location.href = '/';
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)' }}>Profile & Space</h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', fontWeight: 300, marginTop: 'var(--space-2)' }}>
              How AURA adapts to you. You are in complete control of what is remembered.
            </p>
          </div>
          <button className="btn btn--primary btn--glass" onClick={handleSave}>
            {saved ? <><Check size={16} /> Saved</> : 'Save Preferences'}
          </button>
        </div>

        {/* Understanding Me - Emotional Profile Section */}
        <div className="glass-panel" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <Heart size={28} weight="thin" style={{ color: 'var(--accent-rose)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-3xl)' }}>Understanding Me</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 300, marginBottom: 'var(--space-7)', maxWidth: 640 }}>
            These are emotional preferences and comforts you have explicitly shared. AURA does not formulate clinical diagnoses or assumptions. You can add, edit, or remove anything at any time.
          </p>

          <TagSection
            title="What helps me"
            subtitle="Actions, environments, or activities that bring relief when things feel heavy."
            items={profile.whatHelps || []}
            onAdd={(item) => handleAddTag('whatHelps', item)}
            onRemove={(idx) => handleRemoveTag('whatHelps', idx)}
            placeholder="e.g. Taking a hot shower..."
            accentColor="var(--accent-teal)"
          />

          <TagSection
            title="When I’m overwhelmed"
            subtitle="How you prefer support to look during acute moments."
            items={profile.whenOverwhelmed || []}
            onAdd={(item) => handleAddTag('whenOverwhelmed', item)}
            onRemove={(idx) => handleRemoveTag('whenOverwhelmed', idx)}
            placeholder="e.g. Give me space before talking..."
            accentColor="var(--accent-warm)"
          />

          <TagSection
            title="Things that comfort me"
            subtitle="Anchors that feel safe and familiar."
            items={profile.comforts || []}
            onAdd={(item) => handleAddTag('comforts', item)}
            onRemove={(idx) => handleRemoveTag('comforts', idx)}
            placeholder="e.g. Reading an old book..."
            accentColor="var(--accent-calm)"
          />

          <TagSection
            title="Things that don’t help"
            subtitle="Unhelpful reactions or advice to avoid."
            items={profile.doesntHelp || []}
            onAdd={(item) => handleAddTag('doesntHelp', item)}
            onRemove={(idx) => handleRemoveTag('doesntHelp', idx)}
            placeholder="e.g. Being told 'look on the bright side'..."
            accentColor="var(--accent-rose)"
          />

          <TagSection
            title="What makes me feel connected"
            subtitle="Interactions that reduce loneliness and make you feel seen."
            items={profile.connected || []}
            onAdd={(item) => handleAddTag('connected', item)}
            onRemove={(idx) => handleRemoveTag('connected', idx)}
            placeholder="e.g. Talking to a close friend without agenda..."
            accentColor="var(--accent-green)"
          />
        </div>

        {/* Account & Preferences Grid */}
        <div className="bento-grid" style={{ marginBottom: 'var(--space-6)' }}>
          
          {/* Account Details */}
          <div className="bento-item-half glass-panel" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              <User size={24} weight="thin" style={{ color: 'var(--accent-calm)' }} />
              <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Account & Name</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Preferred Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-glass"
                  value={profile.name || ''}
                  onChange={handleChange}
                  placeholder="What should AURA call you?"
                />
              </div>

              <div>
                <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Email (Optional, on-device only)</label>
                <input
                  type="email"
                  name="email"
                  className="input-glass"
                  value={profile.email || ''}
                  onChange={handleChange}
                  placeholder="For local export only"
                />
              </div>
            </div>
          </div>

          {/* Interaction Style */}
          <div className="bento-item-half glass-panel" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              <SlidersHorizontal size={24} weight="thin" style={{ color: 'var(--accent-teal)' }} />
              <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Interaction Style</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Preferred Support Style</label>
                <select name="supportStyle" className="input-glass" value={profile.supportStyle} onChange={handleChange} style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)' }}>
                  <option value="listen" style={{ color: '#000' }}>Just listen, no advice</option>
                  <option value="explore" style={{ color: '#000' }}>Help me explore what I&apos;m feeling</option>
                  <option value="action" style={{ color: '#000' }}>Suggest small manageable steps</option>
                </select>
              </div>

              <div>
                <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Communication Style</label>
                <select name="communicationStyle" className="input-glass" value={profile.communicationStyle} onChange={handleChange} style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)' }}>
                  <option value="gentle" style={{ color: '#000' }}>Gentle, warm, and spacious</option>
                  <option value="direct" style={{ color: '#000' }}>Concise, direct, and focused</option>
                  <option value="poetic" style={{ color: '#000' }}>Reflective, meditative, and quiet</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Notifications & Gentle Reminders */}
        <div className="glass-panel" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Bell size={24} weight="thin" style={{ color: 'var(--accent-warm)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Gentle Reminders</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 300, marginBottom: 'var(--space-5)' }}>
            Optional, non-intrusive invitations. We will never spam or shame you.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {[
              { id: 'checkin', label: 'Daily Check-in', desc: 'A morning check-in prompt' },
              { id: 'journal', label: 'Journal Space', desc: 'Evening quiet reflection' },
              { id: 'support', label: 'Today’s Support', desc: 'A small manageable step' },
              { id: 'reflection', label: 'Evening Reflection', desc: 'Unwind and let go' },
            ].map((rem) => {
              const isActive = profile.reminders?.[rem.id];
              return (
                <button
                  key={rem.id}
                  type="button"
                  className="glass-panel"
                  onClick={() => handleReminderToggle(rem.id)}
                  style={{
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
                    borderColor: isActive ? 'var(--border-glow)' : 'var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{rem.label}</span>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: isActive ? 'var(--accent-green)' : 'var(--border-subtle)' }} />
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{rem.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy & Stored Data */}
        <div className="glass-panel" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <ShieldCheck size={28} weight="thin" style={{ color: 'var(--accent-green)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Privacy & What AURA Remembers</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            AURA operates under strict privacy-first principles. There are no remote database logs or tracking cookies. All your data lives exclusively in this browser.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="glass-panel" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <span className="display-text" style={{ fontSize: 'var(--text-3xl)', color: 'var(--accent-calm)' }}>{stats.chats}</span>
              <p className="label-text" style={{ marginTop: 4 }}>CHAT MESSAGES</p>
            </div>
            <div className="glass-panel" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <span className="display-text" style={{ fontSize: 'var(--text-3xl)', color: 'var(--accent-teal)' }}>{stats.journals}</span>
              <p className="label-text" style={{ marginTop: 4 }}>JOURNAL ENTRIES</p>
            </div>
            <div className="glass-panel" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <span className="display-text" style={{ fontSize: 'var(--text-3xl)', color: 'var(--accent-warm)' }}>{stats.checkins}</span>
              <p className="label-text" style={{ marginTop: 4 }}>CHECK-INS</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-5)' }}>
            {!showDeleteConfirm ? (
              <button
                type="button"
                className="btn btn--glass"
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.3)' }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash size={16} /> Delete all personal data
              </button>
            ) : (
              <div style={{ background: 'rgba(244,63,94,0.1)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244,63,94,0.3)' }}>
                <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)', fontWeight: 500 }}>
                  This will permanently erase all check-ins, journal entries, conversations, and preferences from this device.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button type="button" className="btn btn--primary" style={{ background: 'var(--accent-rose)', color: '#fff' }} onClick={handleDeleteData}>
                    Yes, delete everything
                  </button>
                  <button type="button" className="btn btn--glass" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
