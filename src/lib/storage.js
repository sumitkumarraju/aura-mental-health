// AURA — localStorage persistence layer with Supabase cloud sync
// Offline-first: all data stays on-device in localStorage, and automatically syncs to Supabase when authenticated.

import {
  getProfileDB,
  saveProfileDB,
  saveEmotionDB,
  getEmotionHistoryDB,
  saveCheckinDB,
  getCheckinsDB,
  getJournalEntriesDB,
  saveJournalEntryDB,
  deleteJournalEntryDB,
  getSupportTasksDB,
  insertSupportTasksDB,
  getTrustedContactsDB,
  saveTrustedContactDB,
  deleteTrustedContactDB,
} from './db';

const KEYS = {
  EMOTIONS: 'aura_emotions',
  CHECKINS: 'aura_checkins',
  JOURNAL: 'aura_journal',
  PROFILE: 'aura_profile',
  CHAT: 'aura_chat_history',
  SUPPORT: 'aura_support',
  SETTINGS: 'aura_settings',
  CONTACTS: 'aura_trusted_contacts',
  LAST_SYNC: 'aura_last_sync',
};

function get(key) {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function set(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

// ─── Cloud Sync ──────────────────────────────────────

export async function syncFromSupabase() {
  if (typeof window === 'undefined') return false;
  try {
    const [profile, emotions, checkins, journal, tasks, contacts] = await Promise.allSettled([
      getProfileDB(),
      getEmotionHistoryDB(100),
      getCheckinsDB(50),
      getJournalEntriesDB(),
      getSupportTasksDB(),
      getTrustedContactsDB(),
    ]);

    if (profile.status === 'fulfilled' && profile.value) {
      set(KEYS.PROFILE, profile.value);
    }
    if (emotions.status === 'fulfilled' && emotions.value) {
      set(KEYS.EMOTIONS, emotions.value);
    }
    if (checkins.status === 'fulfilled' && checkins.value) {
      set(KEYS.CHECKINS, checkins.value);
    }
    if (journal.status === 'fulfilled' && journal.value) {
      set(KEYS.JOURNAL, journal.value);
    }
    if (tasks.status === 'fulfilled' && tasks.value?.length > 0) {
      set(KEYS.SUPPORT, tasks.value);
    }
    if (contacts.status === 'fulfilled' && contacts.value) {
      set(KEYS.CONTACTS, contacts.value);
    }

    set(KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (err) {
    console.warn('Sync from Supabase failed (offline or unauthenticated):', err);
    return false;
  }
}

export async function syncToSupabase() {
  if (typeof window === 'undefined') return false;
  try {
    const profile = getProfile();
    const emotions = getEmotionHistory();
    const journal = getJournalEntries();
    const contacts = getTrustedContacts();

    if (profile) await saveProfileDB(profile);
    for (const entry of journal) {
      await saveJournalEntryDB(entry);
    }
    for (const contact of contacts) {
      await saveTrustedContactDB(contact);
    }

    set(KEYS.LAST_SYNC, new Date().toISOString());
    return true;
  } catch (err) {
    console.warn('Sync to Supabase failed:', err);
    return false;
  }
}

// ─── Emotions ────────────────────────────────────────

export function getEmotionHistory() {
  return get(KEYS.EMOTIONS) || [];
}

export function saveEmotion(emotion) {
  const history = getEmotionHistory();
  const record = {
    ...emotion,
    timestamp: new Date().toISOString(),
  };
  history.push(record);
  set(KEYS.EMOTIONS, history);

  // Background sync to Supabase
  saveEmotionDB(record).catch(() => {});
}

// ─── Check-ins ───────────────────────────────────────

export function getCheckins() {
  return get(KEYS.CHECKINS) || [];
}

export function saveCheckin(checkin) {
  const checkins = getCheckins();
  const record = {
    ...checkin,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  checkins.push(record);
  set(KEYS.CHECKINS, checkins);

  // Background sync to Supabase
  saveCheckinDB(record).catch(() => {});
}

// ─── Journal ─────────────────────────────────────────

export function getJournalEntries() {
  return get(KEYS.JOURNAL) || [];
}

export function saveJournalEntry(entry) {
  const entries = getJournalEntries();
  const existing = entries.findIndex((e) => e.id === entry.id);
  let savedEntry;
  if (existing >= 0) {
    savedEntry = { ...entry, updatedAt: new Date().toISOString() };
    entries[existing] = savedEntry;
  } else {
    savedEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    entries.unshift(savedEntry);
  }
  set(KEYS.JOURNAL, entries);

  // Background sync to Supabase
  saveJournalEntryDB(savedEntry).catch(() => {});
}

export function deleteJournalEntry(id) {
  const entries = getJournalEntries().filter((e) => e.id !== id);
  set(KEYS.JOURNAL, entries);

  // Background sync to Supabase
  deleteJournalEntryDB(id).catch(() => {});
}

// ─── Chat History ────────────────────────────────────

export function getChatHistory() {
  return get(KEYS.CHAT) || [];
}

export function saveChatMessage(message) {
  const history = getChatHistory();
  history.push({
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  });
  set(KEYS.CHAT, history);
}

export function clearChatHistory() {
  set(KEYS.CHAT, []);
}

// ─── Profile ─────────────────────────────────────────

export function getProfile() {
  return get(KEYS.PROFILE) || {
    name: '',
    whatHelps: [],
    whatDoesntHelp: [],
    whenOverwhelmed: [],
    feelsConnected: [],
    supportStyle: 'listen',
  };
}

export function saveProfile(profile) {
  set(KEYS.PROFILE, profile);

  // Background sync to Supabase
  saveProfileDB(profile).catch(() => {});
}

// ─── Support Tasks ───────────────────────────────────

export function getSupportTasks() {
  return get(KEYS.SUPPORT) || [];
}

export function saveSupportTasks(tasks) {
  set(KEYS.SUPPORT, tasks);

  // Background sync to Supabase
  if (Array.isArray(tasks) && tasks.length > 0) {
    insertSupportTasksDB(tasks).catch(() => {});
  }
}

// ─── Settings ────────────────────────────────────────

export function getSettings() {
  return get(KEYS.SETTINGS) || {
    reminders: {
      checkin: false,
      journal: false,
      task: false,
      reflection: false,
    },
    reminderTimes: {
      checkin: '09:00',
      journal: '20:00',
      task: '12:00',
      reflection: '21:00',
    },
    apiKey: '',
    useRealAI: false,
  };
}

export function saveSettings(settings) {
  set(KEYS.SETTINGS, settings);
}

// ─── Trusted Contacts ────────────────────────────────

export function getTrustedContacts() {
  return get(KEYS.CONTACTS) || [];
}

export function saveTrustedContacts(contacts) {
  set(KEYS.CONTACTS, contacts);

  // Background sync to Supabase
  if (Array.isArray(contacts)) {
    contacts.forEach((c) => saveTrustedContactDB(c).catch(() => {}));
  }
}

export function saveSingleContact(contact) {
  const contacts = getTrustedContacts();
  const existingIndex = contacts.findIndex((c) => c.id === contact.id);
  if (existingIndex >= 0) {
    contacts[existingIndex] = contact;
  } else {
    contacts.push({ ...contact, id: contact.id || Date.now().toString() });
  }
  set(KEYS.CONTACTS, contacts);
  saveTrustedContactDB(contact).catch(() => {});
}

export function deleteContact(id) {
  const contacts = getTrustedContacts().filter((c) => c.id !== id);
  set(KEYS.CONTACTS, contacts);
  deleteTrustedContactDB(id).catch(() => {});
}

// ─── Clear All ───────────────────────────────────────

export function clearAllData() {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
