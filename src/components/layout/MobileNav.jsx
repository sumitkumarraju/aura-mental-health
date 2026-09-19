'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  House,
  ChatCircleDots,
  CalendarCheck,
  Leaf,
  DotsThreeCircle,
  ChartLineUp,
  Sparkle,
  BookOpen,
  UserCircle,
  GearSix,
  Lifebuoy,
  SignIn,
  SignOut,
  X,
} from '@phosphor-icons/react';

const MAIN_TABS = [
  { href: '/', label: 'Home', icon: House },
  { href: '/chat', label: 'Chat', icon: ChatCircleDots },
  { href: '/checkin', label: 'Check-in', icon: CalendarCheck },
  { href: '/calm', label: 'Calm', icon: Leaf },
];

const MORE_LINKS = [
  { href: '/journey', label: 'Emotional Journey', icon: ChartLineUp, desc: 'View mood trends & patterns' },
  { href: '/support', label: 'Today’s Support', icon: Sparkle, desc: 'Personalized micro-actions' },
  { href: '/journal', label: 'Private Journal', icon: BookOpen, desc: 'Reflect without judgment' },
  { href: '/profile', label: 'Profile & Preferences', icon: UserCircle, desc: 'What helps & your style' },
  { href: '/settings', label: 'Settings & Cloud Sync', icon: GearSix, desc: 'Reminders & Supabase sync' },
  { href: '/help', label: 'Crisis Resources', icon: Lifebuoy, desc: 'Helplines & safety contacts', warm: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isMoreActive = MORE_LINKS.some((item) => item.href === pathname);

  return (
    <>
      {/* Floating Bottom Nav Dock */}
      <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        <div className="mobile-nav__dock">
          {MAIN_TABS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}
                onClick={() => setSheetOpen(false)}
                aria-label={label}
              >
                <div className="mobile-nav__icon-wrap">
                  <Icon size={22} weight={isActive ? 'fill' : 'light'} />
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="mobile-nav__active-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </div>
                <span className="mobile-nav__label">{label}</span>
              </Link>
            );
          })}

          {/* More / Menu Trigger */}
          <button
            type="button"
            className={`mobile-nav__item ${sheetOpen || isMoreActive ? 'mobile-nav__item--active' : ''}`}
            onClick={() => setSheetOpen((prev) => !prev)}
            aria-label="More navigation options"
            aria-expanded={sheetOpen}
          >
            <div className="mobile-nav__icon-wrap">
              <DotsThreeCircle size={24} weight={sheetOpen || isMoreActive ? 'fill' : 'light'} />
              {(sheetOpen || isMoreActive) && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="mobile-nav__active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </div>
            <span className="mobile-nav__label">More</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Drawer (Emil Kowalski Spring Motion) */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mobile-sheet__backdrop"
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />

            {/* Sheet Content */}
            <motion.div
              initial={{ transform: 'translateY(100%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(100%)' }}
              transition={{ type: 'spring', damping: 32, stiffness: 350 }}
              className="mobile-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
            >
              {/* Drag Handle */}
              <div className="mobile-sheet__handle-wrap" onClick={() => setSheetOpen(false)}>
                <div className="mobile-sheet__handle" />
              </div>

              <div className="mobile-sheet__header">
                <span className="mobile-sheet__title">Explore AURA</span>
                <button
                  type="button"
                  className="mobile-sheet__close-btn"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid of Links */}
              <div className="mobile-sheet__list">
                {MORE_LINKS.map(({ href, label, icon: Icon, desc, warm }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`mobile-sheet__link ${isActive ? 'mobile-sheet__link--active' : ''}`}
                      onClick={() => setSheetOpen(false)}
                      style={warm ? { borderColor: 'rgba(245, 158, 11, 0.25)' } : undefined}
                    >
                      <div
                        className="mobile-sheet__link-icon"
                        style={warm ? { color: 'var(--accent-warm)', background: 'rgba(245, 158, 11, 0.1)' } : undefined}
                      >
                        <Icon size={22} weight={isActive ? 'fill' : 'light'} />
                      </div>
                      <div className="mobile-sheet__link-text">
                        <div className="mobile-sheet__link-title" style={warm ? { color: 'var(--accent-warm)' } : undefined}>
                          {label}
                        </div>
                        <div className="mobile-sheet__link-desc">{desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Auth Footer inside Sheet */}
              <div className="mobile-sheet__footer">
                {user ? (
                  <div className="mobile-sheet__auth-row">
                    <div className="mobile-sheet__auth-info">
                      <span className="mobile-sheet__auth-badge">Connected</span>
                      <span className="mobile-sheet__auth-email">{user.email}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn--glass btn--sm"
                      onClick={() => {
                        signOut();
                        setSheetOpen(false);
                      }}
                      style={{ color: 'var(--accent-warm)' }}
                    >
                      <SignOut size={16} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mobile-sheet__auth-row">
                    <span className="mobile-sheet__auth-hint">Using offline guest mode</span>
                    <Link
                      href="/auth/login"
                      className="btn btn--primary btn--sm"
                      onClick={() => setSheetOpen(false)}
                    >
                      <SignIn size={16} /> Sign In
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
