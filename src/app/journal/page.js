'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getJournalEntries, saveJournalEntry, deleteJournalEntry } from '@/lib/storage';
import {
  PenNib,
  Trash,
  CalendarBlank,
  Quotes,
  MagnifyingGlass,
  PencilSimple,
  Check,
  X,
  Sparkle,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { JOURNAL_PROMPTS, formatDate, formatTime } from '@/lib/utils';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [mode, setMode] = useState('free'); // 'free' | 'guided'
  const [currentPrompt, setCurrentPrompt] = useState(JOURNAL_PROMPTS[0]);
  const [currentText, setCurrentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!currentText.trim()) return;

    const entryData = {
      id: editingId || Date.now().toString(),
      text: currentText.trim(),
      prompt: mode === 'guided' ? currentPrompt : null,
      mode: mode,
    };

    saveJournalEntry(entryData);
    setEntries(getJournalEntries());
    setCurrentText('');
    setEditingId(null);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setCurrentText(entry.text);
    if (entry.prompt) {
      setMode('guided');
      setCurrentPrompt(entry.prompt);
    } else {
      setMode('free');
    }
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCurrentText('');
  };

  const handleDelete = (id) => {
    deleteJournalEntry(id);
    setEntries(getJournalEntries());
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const textMatch = entry.text?.toLowerCase().includes(q);
    const promptMatch = entry.prompt?.toLowerCase().includes(q);
    return textMatch || promptMatch;
  });

  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)' }}>Journal</h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', fontWeight: 300, marginTop: 'var(--space-2)' }}>
              A private space for your thoughts. Everything stays on this device.
            </p>
          </div>
          {savedFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'var(--accent-green)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <Check size={16} /> Saved to private journal
            </motion.div>
          )}
        </div>

        {/* Writing Editor Card */}
        <div
          ref={editorRef}
          className="glass-panel"
          style={{
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            border: editingId ? '1px solid var(--accent-calm)' : '1px solid var(--border-subtle)',
            boxShadow: editingId ? '0 0 30px rgba(139, 92, 246, 0.1)' : 'none',
          }}
        >
          {/* Mode Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setMode('free')}
                style={{
                  padding: '6px 16px',
                  fontSize: 'var(--text-xs)',
                  background: mode === 'free' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: mode === 'free' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                }}
              >
                Free Writing
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setMode('guided')}
                style={{
                  padding: '6px 16px',
                  fontSize: 'var(--text-xs)',
                  background: mode === 'guided' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: mode === 'guided' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                }}
              >
                <Sparkle size={14} style={{ marginRight: 4 }} /> Guided Prompts
              </button>
            </div>

            {editingId && (
              <span className="label-text" style={{ color: 'var(--accent-calm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PencilSimple size={14} /> EDITING ENTRY
              </span>
            )}
          </div>

          {/* Guided Prompt Selector */}
          {mode === 'guided' && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', marginBottom: 'var(--space-4)', color: 'var(--accent-calm)' }}>
                <Quotes size={24} weight="light" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-primary)' }}>
                  {currentPrompt}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {JOURNAL_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setCurrentPrompt(prompt)}
                    style={{
                      background: currentPrompt === prompt ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${currentPrompt === prompt ? 'var(--accent-calm)' : 'var(--border-subtle)'}`,
                      color: currentPrompt === prompt ? 'var(--text-primary)' : 'var(--text-secondary)',
                      padding: 'var(--space-1) var(--space-3)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Textarea */}
          <div style={{ position: 'relative' }}>
            <textarea
              id="journal-input"
              data-testid="journal-textarea"
              className="input-glass"
              placeholder="Write whatever you’re carrying today…"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              rows={6}
              style={{
                minHeight: 180,
                fontSize: 'var(--text-lg)',
                lineHeight: 1.7,
                width: '100%',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {editingId ? (
                <>
                  <button type="button" className="btn btn--glass" onClick={handleCancelEdit}>
                    <X size={16} /> Cancel
                  </button>
                  <button type="button" className="btn btn--primary" onClick={handleSave} disabled={!currentText.trim()}>
                    <Check size={16} /> Update Entry
                  </button>
                </>
              ) : (
                <>
                  {currentText.trim() && (
                    <button type="button" className="btn btn--glass" onClick={() => setCurrentText('')}>
                      <ArrowCounterClockwise size={16} /> Clear
                    </button>
                  )}
                  <button type="button" className="btn btn--primary" onClick={handleSave} disabled={!currentText.trim()}>
                    <PenNib size={16} /> Save Entry
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Previous Entries & Search Section */}
        <div style={{ marginTop: 'var(--space-9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Previous Entries</h2>
              <span className="label-text" style={{ color: 'var(--text-tertiary)' }}>
                {entries.length} {entries.length === 1 ? 'REFLECTION' : 'REFLECTIONS'}
              </span>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <MagnifyingGlass size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input-glass"
                placeholder="Search past entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 40, height: 40, borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Entries Display */}
          {entries.length === 0 ? (
            <div className="glass-panel" style={{ padding: 'var(--space-9)', textAlign: 'center' }}>
              <CalendarBlank size={48} weight="thin" style={{ color: 'var(--text-secondary)', margin: '0 auto var(--space-4)' }} />
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', fontWeight: 300 }}>
                Nothing here yet. Start whenever you&apos;re ready.
              </p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="glass-panel" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', fontWeight: 300 }}>
                No journal entries match &quot;{searchQuery}&quot;.
              </p>
            </div>
          ) : (
            <div className="bento-grid">
              <AnimatePresence>
                {filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bento-item-half glass-panel"
                    style={{
                      padding: 'var(--space-6)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: editingId === entry.id ? '1px solid var(--accent-calm)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <span className="label-text" style={{ color: 'var(--accent-calm)' }}>
                          {formatDate(entry.createdAt || entry.timestamp || Date.now())}
                          {entry.createdAt && (
                            <span style={{ color: 'var(--text-tertiary)', marginLeft: 8 }}>
                              {formatTime(entry.createdAt)}
                            </span>
                          )}
                        </span>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            type="button"
                            className="btn btn--icon"
                            onClick={() => handleEdit(entry)}
                            title="Edit entry"
                            style={{ color: 'var(--text-tertiary)', background: 'transparent', padding: 4 }}
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn--icon"
                            onClick={() => handleDelete(entry.id)}
                            title="Delete entry"
                            style={{ color: 'var(--text-tertiary)', background: 'transparent', padding: 4 }}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>

                      {entry.prompt && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', fontStyle: 'italic' }}>
                          &ldquo;{entry.prompt}&rdquo;
                        </p>
                      )}

                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 300, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                        {entry.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
