'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserCircle, Lifebuoy } from '@phosphor-icons/react';

const PAGE_TITLES = {
  '/': 'Today',
  '/chat': 'AURA',
  '/checkin': 'Check-in',
  '/journey': 'Journey',
  '/support': 'Support',
  '/journal': 'Journal',
  '/calm': 'Calm Space',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/help': 'Crisis Support',
  '/auth/login': 'Sign In',
  '/auth/signup': 'Create Account',
  '/discover': 'Explore',
};

export default function MobileHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] || 'AURA';

  return (
    <header className="mobile-header">
      <div className="mobile-header__inner">
        <Link href="/" className="mobile-header__brand" aria-label="AURA Home">
          <div className="mobile-header__logo-wrap">
            <Image
              src="/images/aura_logo.jpg"
              alt="AURA"
              width={26}
              height={26}
              className="mobile-header__logo"
            />
          </div>
          <span className="mobile-header__title">{title}</span>
        </Link>

        <div className="mobile-header__actions">
          <Link
            href="/help"
            className="mobile-header__icon-btn mobile-header__icon-btn--crisis"
            aria-label="Get Help / Crisis Resources"
          >
            <Lifebuoy size={20} weight="light" />
          </Link>

          <Link
            href={user ? '/profile' : '/auth/login'}
            className="mobile-header__icon-btn"
            aria-label={user ? 'Profile' : 'Sign In'}
          >
            <UserCircle size={22} weight="light" />
            {user && <span className="mobile-header__auth-dot" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
