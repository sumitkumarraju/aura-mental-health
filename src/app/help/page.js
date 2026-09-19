'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  WarningCircle,
  Users,
  Heartbeat,
  Plus,
  Trash,
  Check,
  ShieldCheck,
  FirstAid,
  ChatCircleText,
} from '@phosphor-icons/react';
import { getTrustedContacts, saveTrustedContacts } from '@/lib/storage';

const CRISIS_RESOURCES = [
  {
    title: '988 Suicide & Crisis Lifeline',
    phone: '988',
    action: 'tel:988',
    desc: 'Free, confidential, 24/7 support via call or text.',
    badge: '24/7 CALL & TEXT',
  },
  {
    title: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    action: 'sms:741741?&body=HOME',
    desc: 'Connect with a crisis counselor 24/7 over text message.',
    badge: 'TEXT ONLY',
  },
  {
    title: 'The Trevor Project (LGBTQ Youth)',
    phone: '1-866-488-7386',
    action: 'tel:18664887386',
    desc: 'Specialized 24/7 crisis intervention for LGBTQ young people.',
    badge: 'SPECIALIZED',
  },
  {
    title: 'Veterans Crisis Line',
    phone: '988, Press 1',
    action: 'tel:988',
    desc: 'Caring, qualified responders for Veterans and their loved ones.',
    badge: 'VETERANS',
  },
];

export default function HelpPage() {
  const [contacts, setContacts] = useState([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    const saved = getTrustedContacts();
    if (saved && saved.length > 0) {
      setContacts(saved);
    } else {
      const initial = [
        { id: '1', name: 'Maya', relationship: 'Close Friend', phone: '555-0192' },
      ];
      setContacts(initial);
      saveTrustedContacts(initial);
    }
  }, []);

  const handleAddContact = () => {
    if (!newName.trim()) return;
    const updated = [
      ...contacts,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        relationship: newRelationship.trim() || 'Trusted Person',
        phone: newPhone.trim(),
      },
    ];
    setContacts(updated);
    saveTrustedContacts(updated);
    setNewName('');
    setNewRelationship('');
    setNewPhone('');
    setIsAddingContact(false);
  };

  const handleDeleteContact = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveTrustedContacts(updated);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: 880, margin: '0 auto' }}>
        
        {/* Calm, Non-Alarming Emergency Banner */}
        <div
          className="glass-panel"
          style={{
            padding: 'var(--space-8)',
            background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(244,63,94,0.01) 100%)',
            borderColor: 'rgba(244,63,94,0.25)',
            marginBottom: 'var(--space-8)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(244,63,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              color: 'var(--accent-rose)',
            }}
          >
            <FirstAid size={28} weight="thin" />
          </div>

          <h1 className="display-text" style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>
            Support is always available.
          </h1>
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              fontWeight: 300,
              marginBottom: 'var(--space-6)',
              maxWidth: 580,
              margin: '0 auto var(--space-6)',
              lineHeight: 1.6,
            }}
          >
            If you are in immediate danger, experiencing acute physical pain, or feel you cannot stay safe right now, human help is available immediately.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <a
              href="tel:911"
              className="btn btn--primary"
              style={{
                background: 'var(--accent-rose)',
                color: '#fff',
                fontSize: 'var(--text-base)',
                padding: 'var(--space-3) var(--space-6)',
              }}
            >
              <Phone size={18} weight="bold" /> Call Emergency (911)
            </a>
            <a
              href="tel:988"
              className="btn btn--glass"
              style={{
                fontSize: 'var(--text-base)',
                padding: 'var(--space-3) var(--space-6)',
                borderColor: 'rgba(244,63,94,0.3)',
              }}
            >
              <Phone size={18} /> Call Lifeline (988)
            </a>
          </div>
        </div>

        {/* 1. Trusted Contacts */}
        <div className="glass-panel" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Users size={24} weight="thin" style={{ color: 'var(--accent-warm)' }} />
              <div>
                <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Trusted Contacts</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 300 }}>
                  People in your life who make you feel grounded and safe.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn--glass"
              onClick={() => setIsAddingContact(!isAddingContact)}
              style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
            >
              <Plus size={14} /> Add Contact
            </button>
          </div>

          {/* Add Contact Form */}
          <AnimatePresence>
            {isAddingContact && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: 'var(--space-5)', padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Relationship (e.g. Sibling)"
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Phone or handle"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                  <button type="button" className="btn btn--glass" onClick={() => setIsAddingContact(false)} style={{ fontSize: 'var(--text-xs)' }}>Cancel</button>
                  <button type="button" className="btn btn--primary" onClick={handleAddContact} disabled={!newName.trim()} style={{ fontSize: 'var(--text-xs)' }}>Save Contact</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contacts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="glass-panel"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', fontWeight: 400 }}>{contact.name}</h4>
                  <span className="label-text" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{contact.relationship}</span>
                  {contact.phone && (
                    <p style={{ color: 'var(--accent-teal)', fontSize: 'var(--text-sm)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{contact.phone}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="btn btn--icon btn--glass"
                      title="Call contact"
                      style={{ padding: 6 }}
                    >
                      <Phone size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn--icon"
                    onClick={() => handleDeleteContact(contact.id)}
                    style={{ background: 'transparent', color: 'var(--text-tertiary)', padding: 6 }}
                    title="Remove"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Crisis Resources */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Phone size={20} style={{ color: 'var(--accent-teal)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>24/7 Crisis Resources</h2>
          </div>

          <div className="bento-grid" style={{ marginTop: 0 }}>
            {CRISIS_RESOURCES.map((resource, i) => (
              <div key={i} className="bento-item-half">
                <div
                  className="glass-panel"
                  style={{
                    padding: 'var(--space-6)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <span className="label-text" style={{ color: 'var(--accent-teal)' }}>{resource.badge}</span>
                    </div>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                      {resource.title}
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.5, marginBottom: 'var(--space-5)' }}>
                      {resource.desc}
                    </p>
                  </div>

                  <a
                    href={resource.action}
                    className="btn btn--glass"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    {resource.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Professional Support */}
        <div className="glass-panel" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <Heartbeat size={24} weight="thin" style={{ color: 'var(--accent-calm)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Professional Support</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 300, marginBottom: 'var(--space-5)', maxWidth: 600, lineHeight: 1.6 }}>
            A therapist or licensed counselor offers specialized human care for deep patterns, trauma, and long-term emotional well-being.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <a
              href="https://www.psychologytoday.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--glass"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Psychology Today Directory ↗
            </a>
            <a
              href="https://openpathcollective.org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--glass"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Open Path (Affordable Therapy) ↗
            </a>
            <a
              href="https://findtreatment.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--glass"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              SAMHSA Treatment Finder ↗
            </a>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
