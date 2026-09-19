'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import Image from 'next/image';
import {
  House,
  ChatCircleDots,
  Compass,
  CalendarCheck,
  ChartLineUp,
  Sparkle,
  BookOpen,
  Leaf,
  Lifebuoy,
  UserCircle,
  GearSix,
  SignIn,
} from '@phosphor-icons/react';
import { useAuth } from '@/components/auth/AuthProvider';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: House },
  { href: '/chat', label: 'Chat', icon: ChatCircleDots },
  { href: '/checkin', label: 'Check-in', icon: CalendarCheck },
  { href: '/journey', label: 'Journey', icon: ChartLineUp },
  { href: '/support', label: 'Support', icon: Sparkle },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/calm', label: 'Calm', icon: Leaf },
];

const BOTTOM_ITEMS = [
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: GearSix },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div style={{ padding: '0 var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ position: 'relative', width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 20px rgba(255,255,255,0.05)', border: '1px solid var(--border-glow)' }}>
            <Image
              src="/images/aura_logo.jpg"
              alt="AURA Logo"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 300,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            AURA
          </span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
              <span className="sidebar__link-icon" style={{ opacity: isActive ? 1 : 0.6 }}>
                <Icon size={20} weight={isActive ? 'regular' : 'light'} />
              </span>
              <span style={{ fontWeight: isActive ? 400 : 300 }}>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  style={{
                    position: 'absolute',
                    right: 'var(--space-2)',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--text-primary)',
                    boxShadow: '0 0 10px var(--text-primary)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />

        <div style={{ padding: 'var(--space-4) 0', borderTop: '1px solid var(--border-subtle)', marginTop: 'var(--space-4)' }}>
          <Link
            href="/help"
            className={`sidebar__link ${pathname === '/help' ? 'sidebar__link--active' : ''}`}
            style={{ color: 'var(--accent-warm)' }}
          >
            <span className="sidebar__link-icon">
              <Lifebuoy size={20} weight={pathname === '/help' ? 'regular' : 'light'} />
            </span>
            <span>Get Help</span>
          </Link>

          {!user && (
            <Link
              href="/auth/login"
              className={`sidebar__link ${pathname === '/auth/login' ? 'sidebar__link--active' : ''}`}
            >
              <span className="sidebar__link-icon" style={{ opacity: pathname === '/auth/login' ? 1 : 0.6 }}>
                <SignIn size={20} weight={pathname === '/auth/login' ? 'regular' : 'light'} />
              </span>
              <span style={{ fontWeight: pathname === '/auth/login' ? 400 : 300 }}>Sign In</span>
            </Link>
          )}

          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
                <span className="sidebar__link-icon" style={{ opacity: isActive ? 1 : 0.6 }}>
                  <Icon size={20} weight={isActive ? 'regular' : 'light'} />
                </span>
                <span style={{ fontWeight: isActive ? 400 : 300 }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
