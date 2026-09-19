// AURA — Utility functions

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function getGentleMessage() {
  const messages = [
    "You don't have to figure everything out today.",
    "It's okay to take things one moment at a time.",
    "Whatever you're feeling right now is valid.",
    "You showed up. That already matters.",
    "There's no right way to feel today.",
    "Be gentle with yourself.",
    "You're allowed to rest.",
    "This is your space. No expectations.",
    "Some days just need to be gotten through. That's enough.",
    "You don't have to be okay right now.",
  ];
  const index = Math.floor(Date.now() / (1000 * 60 * 60)) % messages.length;
  return messages[index];
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const EMOTIONS = [
  { id: 'happy', label: 'Happy', color: 'var(--accent-warm)' },
  { id: 'calm', label: 'Calm', color: 'var(--accent-teal)' },
  { id: 'okay', label: 'Okay', color: 'var(--accent-green)' },
  { id: 'sad', label: 'Sad', color: 'var(--accent-calm)' },
  { id: 'lonely', label: 'Lonely', color: 'var(--accent-lavender)' },
  { id: 'anxious', label: 'Anxious', color: 'var(--accent-warm)' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: 'var(--accent-rose)' },
  { id: 'angry', label: 'Angry', color: 'var(--accent-rose)' },
  { id: 'empty', label: 'Empty', color: 'var(--text-tertiary)' },
  { id: 'stressed', label: 'Stressed', color: 'var(--accent-warm)' },
];

export const JOURNAL_PROMPTS = [
  "What are you carrying today?",
  "What do you wish someone understood about you?",
  "What made today slightly better?",
  "What are you afraid to say out loud?",
  "What do you need right now?",
  "What would you tell someone you love if they were feeling this way?",
];

export const QUICK_ACTIONS = [
  {
    id: 'talk',
    label: 'Talk to AURA',
    description: 'Have a conversation about what you\'re feeling',
    href: '/chat',
    color: 'var(--accent-calm)',
  },
  {
    id: 'understand',
    label: 'Help me understand what I\'m feeling',
    description: 'A guided exploration of your emotions',
    href: '/discover',
    color: 'var(--accent-lavender)',
  },
  {
    id: 'calm',
    label: 'Calm me down',
    description: 'Breathing exercises and grounding',
    href: '/calm',
    color: 'var(--accent-teal)',
  },
  {
    id: 'listen',
    label: 'I just need someone to listen',
    description: 'AURA will listen without giving advice',
    href: '/chat?mode=listen',
    color: 'var(--accent-warm)',
  },
  {
    id: 'thoughts',
    label: 'Help me with my thoughts',
    description: 'Write down or talk through what\'s on your mind',
    href: '/journal',
    color: 'var(--accent-green)',
  },
  {
    id: 'unsure',
    label: "I don't know what I need",
    description: "That's okay. Let's figure it out together.",
    href: '/discover',
    color: 'var(--text-secondary)',
  },
];
