'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { EnvelopeSimple, LockSimple, ArrowRight, Sparkle } from '@phosphor-icons/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState('password'); // 'password' | 'magic'

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      if (mode === 'magic') {
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        setMagicLinkSent(true);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
          style={{ padding: 'var(--space-8)', maxWidth: 440, width: '100%', textAlign: 'center' }}
        >
          <EnvelopeSimple size={48} style={{ color: 'var(--accent-teal)', margin: '0 auto var(--space-4)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 300 }}>
            Check your email
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', fontWeight: 300 }}>
            We sent a magic link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click it to sign in.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 440, width: '100%' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', margin: '0 auto var(--space-3)', border: '1px solid var(--border-glow)' }}>
            <Image src="/images/aura_logo.jpg" alt="AURA" fill style={{ objectFit: 'cover' }} />
          </div>
          <h1 className="display-text" style={{ fontSize: 'var(--text-3xl)' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 300, marginTop: 'var(--space-1)' }}>
            Your private emotional space is waiting.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            <button
              type="button"
              onClick={() => setMode('password')}
              className="btn btn--glass"
              style={{
                flex: 1,
                fontSize: 'var(--text-xs)',
                background: mode === 'password' ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderColor: mode === 'password' ? 'var(--border-glow)' : 'var(--border-subtle)',
              }}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className="btn btn--glass"
              style={{
                flex: 1,
                fontSize: 'var(--text-xs)',
                background: mode === 'magic' ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderColor: mode === 'magic' ? 'var(--border-glow)' : 'var(--border-subtle)',
              }}
            >
              <Sparkle size={14} /> Magic Link
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <EnvelopeSimple size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="email"
                  className="input-glass"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: 44, borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>

            {mode === 'password' && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <LockSimple size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    className="input-glass"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ paddingLeft: 44, borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p style={{ color: 'var(--accent-rose)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
            >
              {loading ? 'Signing in...' : mode === 'magic' ? 'Send Magic Link' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent-teal)', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
