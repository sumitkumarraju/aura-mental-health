import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const SUPPORT_POOL = [
  {
    category: 'Connect',
    title: 'Talk to someone you trust.',
    description: 'Reach out with a short message or call to someone who makes you feel safe.',
    time: '15 min',
    icon: 'users',
    color: '#F59E0B',
  },
  {
    category: 'Express',
    title: 'Write down what\'s been occupying your mind.',
    description: 'Put your thoughts on the page without judging grammar, coherence, or logic.',
    time: '5 min',
    icon: 'pencil',
    href: '/journal',
    color: '#8B5CF6',
  },
  {
    category: 'Reflect',
    title: 'Explore a recurring thought.',
    description: 'Notice what your mind returns to, and ask yourself what it might be trying to protect.',
    time: '7 min',
    icon: 'chat',
    href: '/chat',
    color: '#BB9AF7',
  },
  {
    category: 'Ground',
    title: 'Try a 5-4-3-2-1 grounding exercise.',
    description: 'Re-orient your nervous system by naming sensations in your immediate environment.',
    time: '3 min',
    icon: 'compass',
    href: '/calm',
    color: '#10B981',
  },
  {
    category: 'Calm',
    title: 'Take four cycles of box breathing.',
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Let your shoulders drop.',
    time: '2 min',
    icon: 'leaf',
    href: '/calm',
    color: '#14B8A6',
  },
  {
    category: 'Move',
    title: 'Take a short mindful walk.',
    description: 'Step outside or gently walk around the room. Feel gravity and movement.',
    time: '10 min',
    icon: 'walk',
    color: '#F59E0B',
  },
  {
    category: 'Comfort',
    title: 'Listen to something that makes you feel safe.',
    description: 'Immerse yourself in a familiar soundscape or album without distraction.',
    time: '10 min',
    icon: 'music',
    href: '/calm',
    color: '#14B8A6',
  },
];

function generateReason(category, recentEmotions = []) {
  const reasons = {
    Connect: 'Meaningful connections bring deep comfort and reduce isolation.',
    Express: 'Expressing thoughts outwardly helps decompress cognitive overload.',
    Reflect: 'Recurring thoughts often point to an unspoken need worth exploring.',
    Ground: 'Sensory anchoring brings attention back from future worries to physical safety.',
    Calm: 'Rhythmic breathwork activates the parasympathetic rest response.',
    Move: 'Light movement helps discharge stored adrenaline from tension.',
    Comfort: 'Familiar, soothing stimuli help regulate your nervous system.',
  };

  if (recentEmotions.includes('anxious') || recentEmotions.includes('overwhelmed')) {
    if (category === 'Calm') return 'You\'ve been feeling anxious lately. Breathwork directly calms the nervous system.';
    if (category === 'Ground') return 'Grounding exercises are especially effective when anxiety is present.';
  }

  if (recentEmotions.includes('lonely')) {
    if (category === 'Connect') return 'You\'ve mentioned feeling lonely recently. Even a short connection can help.';
  }

  return reasons[category] || 'This was chosen to support your emotional wellbeing today.';
}

export async function POST() {
  try {
    let recentEmotions = [];
    let userId = null;

    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: emotions } = await supabase
          .from('emotions')
          .select('emotion')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (emotions) {
          recentEmotions = emotions.map((e) => e.emotion);
        }
      }
    } catch {
      // Supabase not configured
    }

    // Pick 3 diverse tasks
    const shuffled = [...SUPPORT_POOL].sort(() => Math.random() - 0.5);
    const categories = new Set();
    const selected = [];

    for (const task of shuffled) {
      if (!categories.has(task.category) && selected.length < 3) {
        categories.add(task.category);
        selected.push({
          ...task,
          reason: generateReason(task.category, recentEmotions),
        });
      }
    }

    // Save to DB if authenticated
    if (userId) {
      try {
        const supabase = await createServerSupabaseClient();
        const rows = selected.map((t) => ({
          user_id: userId,
          category: t.category,
          title: t.title,
          description: t.description,
          time_estimate: t.time,
          reason: t.reason,
          icon: t.icon,
          color: t.color,
          href: t.href || null,
        }));
        await supabase.from('support_tasks').insert(rows);
      } catch {
        // Ignore save errors
      }
    }

    return NextResponse.json({ tasks: selected });
  } catch (err) {
    console.error('Support generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
