import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/ai-client';

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
    title: "Write down what's been occupying your mind.",
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

function generateFallbackTasks(recentEmotions = []) {
  const shuffled = [...SUPPORT_POOL].sort(() => Math.random() - 0.5);
  const categories = new Set();
  const selected = [];

  for (const task of shuffled) {
    if (!categories.has(task.category) && selected.length < 3) {
      categories.add(task.category);
      selected.push({
        ...task,
        reason: recentEmotions.includes('anxious')
          ? "Chosen to dial down mental chatter and ground your nervous system."
          : "Tailored to offer gentle clarity and momentum today.",
      });
    }
  }
  return selected;
}

export async function POST() {
  try {
    let recentEmotions = [];
    let userStats = '';
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
          .limit(8);

        if (emotions?.length > 0) {
          recentEmotions = emotions.map((e) => e.emotion);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('name, what_helps, support_style')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          userStats = `User: ${profile.name || 'Friend'}. Preferred support: ${profile.support_style || 'listen'}. Helps: ${(profile.what_helps || []).join(', ')}`;
        }
      }
    } catch (err) {
      console.warn('[AURA-Support] Context retrieval notice:', err.message);
    }

    // Attempt AI-driven dynamic micro-task generation
    let tasks = null;

    const aiPrompt = `You are AURA's clinical psychological task director.
Generate exactly 3 diverse, actionable micro-tasks for the user today based on their emotional profile.
Recent feelings: ${recentEmotions.join(', ') || 'neutral, seeking balance'}.
User info: ${userStats || 'general user seeking calm and mental clarity'}.

Requirements:
- Each task must have:
  "category": one of ["Calm", "Express", "Reflect", "Ground", "Move", "Connect", "Comfort"]
  "title": concise 4-7 word title
  "description": 1-2 sentence actionable description
  "time": estimate (e.g. "3 min", "5 min", "10 min")
  "reason": witty, warm psychological explanation of why their brain needs this today (use gentle emotional humor, e.g. "Because doomscrolling won't solve that email")
  "color": a hex accent (e.g. "#14B8A6", "#8B5CF6", "#F59E0B", "#10B981")
  "href": optional link (e.g. "/calm", "/journal", "/chat", or null)

Return ONLY valid JSON array with 3 objects. No markdown ticks, no commentary.`;

    const aiResult = await createChatCompletion({
      messages: [
        { role: 'system', content: 'You output pure JSON arrays only.' },
        { role: 'user', content: aiPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (aiResult.success) {
      try {
        const cleaned = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          tasks = parsed.slice(0, 3).map((t) => ({
            category: t.category || 'Reflect',
            title: t.title || 'Take a moment for yourself',
            description: t.description || 'Step back and check in with your mind.',
            time: t.time || '5 min',
            reason: t.reason || 'To bring balance back to your day.',
            color: t.color || '#14B8A6',
            icon: t.category === 'Calm' ? 'leaf' : t.category === 'Express' ? 'pencil' : t.category === 'Connect' ? 'users' : 'compass',
            href: t.href || (t.category === 'Calm' ? '/calm' : t.category === 'Express' ? '/journal' : t.category === 'Reflect' ? '/chat' : null),
          }));
        }
      } catch (parseErr) {
        console.warn('[AURA-Support] AI JSON parse error, using fallback:', parseErr.message);
      }
    }

    if (!tasks) {
      tasks = generateFallbackTasks(recentEmotions);
    }

    // Save to Supabase if authenticated
    if (userId) {
      try {
        const supabase = await createServerSupabaseClient();
        const rows = tasks.map((t) => ({
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
      } catch (saveErr) {
        console.warn('[AURA-Support] DB save notice:', saveErr.message);
      }
    }

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error('Support generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
