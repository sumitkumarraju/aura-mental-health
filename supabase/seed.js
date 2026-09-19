// Supabase Seeding Script for AURA (aura-mental-health)
const SUPABASE_MGMT_TOKEN = process.env.SUPABASE_MGMT_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF || 'kqrzljexgotcswsvetzx';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_MGMT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (data.message) {
    throw new Error(`SQL Error: ${data.message}`);
  }
  return data;
}

async function main() {
  console.log('Seeding emotion definitions and support templates...');

  const seedCatalogSQL = `
    INSERT INTO public.emotion_definitions (name, category, description, color) VALUES
    ('happy', 'Positive', 'A sense of joy, fulfillment, or lighthearted warmth.', '#10B981'),
    ('calm', 'Grounded', 'A peaceful, quiet state of mind and steady breath.', '#14B8A6'),
    ('okay', 'Neutral', 'Balanced, functional, neither strongly high nor low.', '#8B5CF6'),
    ('reflective', 'Introspective', 'Looking inward, processing memories or feelings.', '#BB9AF7'),
    ('sad', 'Tender', 'A gentle sorrow, heaviness in the chest, or quiet longing.', '#6366F1'),
    ('lonely', 'Social', 'Feeling disconnected from others or longing for understanding.', '#EC4899'),
    ('anxious', 'High-Energy', 'Racing thoughts, tightness in the chest, anticipatory worry.', '#F59E0B'),
    ('overwhelmed', 'High-Energy', 'Too much sensory or emotional input to process at once.', '#EF4444'),
    ('angry', 'High-Energy', 'Frustration, boundary violation, or heated energy.', '#F97316'),
    ('empty', 'Low-Energy', 'Emotional numbness, exhaustion, or dissociation.', '#64748B'),
    ('stressed', 'High-Energy', 'Carrying too much weight, pressure to perform or fix.', '#D97706')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO public.support_templates (category, title, description, time_estimate, reason, icon, color, href) VALUES
    ('Connect', 'Talk to someone you trust.', 'Reach out with a short message or call to someone who makes you feel safe.', '15 min', 'Meaningful connections bring deep comfort and reduce isolation.', 'users', '#F59E0B', NULL),
    ('Express', 'Write down what has been occupying your mind.', 'Put your thoughts on the page without judging grammar, coherence, or logic.', '5 min', 'Expressing thoughts outwardly helps decompress cognitive overload.', 'pencil', '#8B5CF6', '/journal'),
    ('Reflect', 'Explore a recurring thought.', 'Notice what your mind returns to, and ask yourself what it might be trying to protect.', '7 min', 'Recurring thoughts often point to an unspoken need worth exploring.', 'chat', '#BB9AF7', '/chat'),
    ('Ground', 'Try a 5-4-3-2-1 grounding exercise.', 'Re-orient your nervous system by naming sensations in your immediate environment.', '3 min', 'Sensory anchoring brings attention back from future worries to physical safety.', 'compass', '#10B981', '/calm'),
    ('Calm', 'Take four cycles of box breathing.', 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Let your shoulders drop.', '2 min', 'Rhythmic breathwork activates the parasympathetic rest response.', 'leaf', '#14B8A6', '/calm'),
    ('Move', 'Take a short mindful walk.', 'Step outside or gently walk around the room. Feel gravity and movement.', '10 min', 'Light movement helps discharge stored adrenaline from tension.', 'walk', '#F59E0B', NULL),
    ('Comfort', 'Listen to something that makes you feel safe.', 'Immerse yourself in a familiar soundscape or album without distraction.', '10 min', 'Familiar, soothing stimuli help regulate your nervous system.', 'music', '#14B8A6', '/calm')
    ON CONFLICT DO NOTHING;
  `;

  await runSQL(seedCatalogSQL);
  console.log('✅ Emotion definitions & support templates seeded successfully.');

  // Check if a demo user already exists
  const existingUsers = await runSQL("SELECT id FROM auth.users WHERE email = 'sumit@aura.space';");
  let userId;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
    console.log('User sumit@aura.space already exists:', userId);
  } else {
    console.log('Creating demo user sumit@aura.space...');
    const createRes = await fetch('https://kqrzljexgotcswsvetzx.supabase.co/auth/v1/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sumit@aura.space',
        password: 'AuraPassword2026!',
        email_confirm: true,
        user_metadata: { name: 'Sumit' },
      }),
    });

    const createdUser = await createRes.json();
    if (!createdUser.id) {
      console.error('Failed to create user via Auth Admin API:', createdUser);
      return;
    }
    userId = createdUser.id;
    console.log('✅ Created user with id:', userId);
  }

  // Update profile and insert personal seed data
  const seedUserDataSQL = `
    -- Profile
    UPDATE public.profiles SET
      name = 'Sumit',
      what_helps = ARRAY['Solitude in dim light', 'Slow walks without headphones', 'Warm herbal tea', 'Deep ambient music'],
      what_doesnt_help = ARRAY['Being told to cheer up', 'Crowded loud places', 'Excessive unsolicited advice'],
      when_overwhelmed = ARRAY['Close eyes and breathe', 'Step into a quiet room', 'Write out stream-of-consciousness'],
      feels_connected = ARRAY['Honest one-on-one conversation', 'Shared silence with someone trusted'],
      support_style = 'listen',
      onboarding_completed = true
    WHERE user_id = '${userId}';

    -- Emotions history (last 7 days)
    INSERT INTO public.emotions (user_id, emotion, free_text, intensity, created_at) VALUES
    ('${userId}', 'calm', 'Quiet morning, soft tea, feeling grounded.', 8, now() - interval '6 days'),
    ('${userId}', 'anxious', 'Work deadlines looming, tight chest sensation.', 7, now() - interval '5 days'),
    ('${userId}', 'overwhelmed', 'Multiple conflicting priorities at once.', 8, now() - interval '4 days'),
    ('${userId}', 'reflective', 'Walking in the evening, thinking about balance.', 6, now() - interval '3 days'),
    ('${userId}', 'sad', 'Felt a sudden wave of fatigue and loneliness.', 5, now() - interval '2 days'),
    ('${userId}', 'okay', 'Recovering energy, gentle pace today.', 6, now() - interval '1 day'),
    ('${userId}', 'calm', 'Taking things one step at a time.', 8, now() - interval '2 hours');

    -- Daily Check-ins
    INSERT INTO public.checkins (user_id, emotion, body_sensation, energy_level, sleep_quality, notes, created_at) VALUES
    ('${userId}', 'anxious', 'Tight shoulders, shallow breath', 2, 2, 'Woke up thinking about tomorrow.', now() - interval '5 days'),
    ('${userId}', 'overwhelmed', 'Heavy behind eyes, jaw clenched', 2, 3, 'Needed to step away from screens.', now() - interval '4 days'),
    ('${userId}', 'reflective', 'Soft chest, relaxed breathing', 4, 4, 'Evening walk helped reset.', now() - interval '3 days'),
    ('${userId}', 'okay', 'Neutral, steady pulse', 3, 4, 'Day went relatively smoothly.', now() - interval '1 day'),
    ('${userId}', 'calm', 'Grounded, slow breath, shoulders dropped', 4, 5, 'Felt present throughout the morning.', now() - interval '2 hours');

    -- Journal Entries
    INSERT INTO public.journal_entries (user_id, title, content, mood, prompt_used, is_bookmarked, created_at) VALUES
    (
      '${userId}',
      'Finding quiet in the noise',
      'Today was busy, but I gave myself ten minutes of silence before lunch. Just looking out the window, noticing the light on the leaves. It reminded me that the world does not demand my reaction to every single thing.',
      'calm',
      'What gave you peace today?',
      true,
      now() - interval '3 days'
    ),
    (
      '${userId}',
      'Releasing the need to fix everything',
      'I noticed how quickly my mind jumps to problem-solving whenever an uncomfortable emotion arises. What happens if I just let the discomfort sit with me for five minutes without trying to solve it? It actually softens.',
      'reflective',
      'What emotion are you currently resisting?',
      false,
      now() - interval '1 day'
    ),
    (
      '${userId}',
      'Morning gratitude',
      'Woke up early before the city started making sound. The air was cool and clear. Feeling grateful for small pockets of stillness.',
      'calm',
      NULL,
      true,
      now() - interval '4 hours'
    );

    -- Support Tasks
    INSERT INTO public.support_tasks (user_id, category, title, description, time_estimate, reason, icon, color, href, status, assigned_date) VALUES
    ('${userId}', 'Calm', 'Four cycles of box breathing', 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Let your shoulders drop.', '2 min', 'Rhythmic breathwork activates the parasympathetic rest response.', 'leaf', '#14B8A6', '/calm', 'completed', CURRENT_DATE),
    ('${userId}', 'Express', 'Write down what has been occupying your mind', 'Put your thoughts on the page without judging grammar or logic.', '5 min', 'Expressing thoughts outwardly helps decompress cognitive overload.', 'pencil', '#8B5CF6', '/journal', 'active', CURRENT_DATE),
    ('${userId}', 'Connect', 'Send a short thoughtful message to a friend', 'Just a hello, thinking of you, or a photo from your day.', '5 min', 'Meaningful connection grounds the nervous system.', 'users', '#F59E0B', NULL, 'active', CURRENT_DATE);

    -- Trusted Contacts
    INSERT INTO public.trusted_contacts (user_id, name, phone, relationship, is_emergency) VALUES
    ('${userId}', 'Maya Sharma', '+91 98765 43210', 'Close Friend', true),
    ('${userId}', 'Dr. Ananya (Counselor)', '+91 98123 45678', 'Therapist', false);
  `;

  await runSQL(seedUserDataSQL);
  console.log('✅ User profile, emotions history, check-ins, journal, tasks, and contacts seeded successfully!');
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
