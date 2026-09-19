'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { EnvelopeSimple, LockSimple, User, ArrowRight } from '@phosphor-icons/react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (err) throw err;

      // Auto-confirm is enabled, ensure session is set and log in immediately
      if (!data?.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
      }

      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="display-text" style={{ fontSize: 'var(--text-3xl)' }}>Create your space</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 300, marginTop: 'var(--space-1)' }}>
            Your feelings deserve a safe place to land.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Your name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="input-glass"
                  placeholder="What should AURA call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: 44, borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>

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

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <LockSimple size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="password"
                  className="input-glass"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingLeft: 44, borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>

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
              {loading ? 'Creating...' : 'Create Account'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent-teal)', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
