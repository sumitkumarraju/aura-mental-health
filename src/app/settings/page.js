'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { getSettings, saveSettings, syncFromSupabase, syncToSupabase } from '@/lib/storage';
import { useAuth } from '@/components/auth/AuthProvider';
import { GearSix, Bell, Cpu, CloudCheck, UserCircle, SignOut, SignIn, ArrowsClockwise } from '@phosphor-icons/react';

export default function SettingsPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [settings, setSettings] = useState({
    reminders: { checkin: false, journal: false },
    reminderTimes: { checkin: '09:00', journal: '20:00' },
    apiKey: '',
    useRealAI: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSettings();
    if (s) setSettings(s);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const ok = await syncFromSupabase();
      if (ok) {
        setSyncMessage('Successfully synchronized with Supabase cloud.');
      } else {
        setSyncMessage('Sync complete (offline or guest mode).');
      }
    } catch {
      setSyncMessage('Sync failed. Please check connection.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000);
    }
  };

  const toggleReminder = (key) => {
    setSettings(prev => ({
      ...prev,
      reminders: { ...prev.reminders, [key]: !prev.reminders[key] }
    }));
    setSaved(false);
  };

  const updateTime = (key, val) => {
    setSettings(prev => ({
      ...prev,
      reminderTimes: { ...prev.reminderTimes, [key]: val }
    }));
    setSaved(false);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-8)' }}>Settings</h1>

        {/* Account & Cloud Sync Section */}
        <div className="glass-panel" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <CloudCheck size={28} weight="thin" style={{ color: 'var(--accent-teal)' }} />
              <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Account & Cloud Sync</h2>
            </div>
            {user && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-teal)', background: 'rgba(20, 184, 166, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                Cloud Connected
              </span>
            )}
          </div>
          
          <div style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--space-4)' }}>
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 400, color: 'var(--text-primary)' }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    Your emotions, journal, and support tasks sync to Supabase with Row Level Security.
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="btn btn--glass btn--sm"
                  style={{ color: 'var(--accent-warm)' }}
                >
                  <SignOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 400, color: 'var(--text-primary)' }}>
                    Guest Mode (Offline-first)
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    All data is kept locally on this device. Sign in to back up and sync across devices.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Link href="/auth/login" className="btn btn--glass btn--sm">
                    <SignIn size={16} /> Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn btn--primary btn--sm">
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              className="btn btn--glass btn--sm"
              onClick={handleSync}
              disabled={syncing}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <ArrowsClockwise size={16} className={syncing ? 'spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync with Supabase'}
            </button>
            {syncMessage && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-teal)' }}>
                {syncMessage}
              </span>
            )}
          </div>
        </div>

        {/* Gentle Reminders Section */}
        <div className="glass-panel" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <Bell size={28} weight="thin" style={{ color: 'var(--accent-warm)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Gentle Reminders</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {['checkin', 'journal'].map((key) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 300, textTransform: 'capitalize' }}>Daily {key}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>A soft nudge to take a moment for yourself.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  {settings.reminders[key] && (
                    <input 
                      type="time" 
                      className="input-glass" 
                      style={{ padding: 'var(--space-2) var(--space-3)', width: 'auto' }}
                      value={settings.reminderTimes[key]} 
                      onChange={(e) => updateTime(key, e.target.value)} 
                    />
                  )}
                  <button 
                    onClick={() => toggleReminder(key)}
                    style={{
                      width: 48, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer',
                      background: settings.reminders[key] ? 'var(--text-primary)' : 'rgba(255,255,255,0.1)',
                      border: 'none', transition: 'all 0.3s ease'
                    }}
                  >
                    <motion.div 
                      animate={{ x: settings.reminders[key] ? 26 : 2 }} 
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ width: 20, height: 20, borderRadius: '50%', background: settings.reminders[key] ? 'var(--bg-deep)' : 'var(--text-secondary)', position: 'absolute', top: 2 }} 
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Configuration Section */}
        <div className="glass-panel" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <Cpu size={28} weight="thin" style={{ color: 'var(--accent-teal)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>AI Configuration</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            AURA runs with empathetic non-clinical guidance. When configured with an OpenAI API key on your server or environment, real AI responses are delivered automatically via <code>/api/chat</code>.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.useRealAI} 
                onChange={(e) => { setSettings(s => ({ ...s, useRealAI: e.target.checked })); setSaved(false); }} 
                style={{ width: 20, height: 20, accentColor: 'var(--accent-teal)' }}
              />
              <span>Enable Real AI Responses</span>
            </label>
            
            {settings.useRealAI && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <input 
                  type="password" 
                  className="input-glass" 
                  placeholder="Enter API Key (e.g. OpenAI or Anthropic)" 
                  value={settings.apiKey}
                  onChange={(e) => { setSettings(s => ({ ...s, apiKey: e.target.value })); setSaved(false); }}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-warm)', marginTop: 'var(--space-2)' }}>
                  Note: Server-side OPENAI_API_KEY in .env.local takes precedence.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn--primary btn--glass" style={{ padding: 'var(--space-3) var(--space-6)' }} onClick={handleSave}>
            {saved ? 'Saved' : 'Save Settings'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
