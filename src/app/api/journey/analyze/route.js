import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/ai-client';

const FALLBACK_OBSERVATIONS = [
  {
    tag: 'SLEEP & ANXIETY DYNAMICS',
    observation: 'When your sleep scores dip below 5, next-day anxiety spikes by nearly 40%. Your brain is running on low fuel and confusing fatigue with existential crisis.',
    accent: 'var(--accent-warm)',
  },
  {
    tag: 'CALM INTERVENTION IMPACT',
    observation: 'Engaging with Calm breathing exercises corresponds with an immediate 2-point reduction in self-reported tension. Grounding works faster than overthinking.',
    accent: 'var(--accent-teal)',
  },
  {
    tag: 'EXPRESSION & JOURNALING',
    observation: 'Days you write reflections in the Journal correlate with more balanced mood entries 24 hours later. Giving feelings a page stops them from pacing in your head.',
    accent: 'var(--accent-calm)',
  },
  {
    tag: 'CONNECTION PATTERNS',
    observation: 'Reaching out to a trusted contact or talking through feelings coincides with your highest energy ratings. Solitude is great, but isolation is a sneaky energy thief.',
    accent: 'var(--accent-green)',
  },
];

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { checkins = [] } = body;

    let userContext = '';
    let recentEmotions = [];

    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, what_helps, support_style')
          .eq('user_id', user.id)
          .single();

        const { data: emotions } = await supabase
          .from('emotions')
          .select('emotion, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (emotions?.length > 0) {
          recentEmotions = emotions.map((e) => e.emotion);
        }

        if (profile) {
          userContext = `User: ${profile.name || 'Friend'}. Preferred support: ${profile.support_style || 'listen'}. What helps: ${(profile.what_helps || []).join(', ')}`;
        }
      }
    } catch (err) {
      console.warn('[AURA-Journey] Context retrieval notice:', err.message);
    }

    const checkinSummary = checkins.slice(0, 10).map((c, i) => 
      `Day ${i + 1}: Mood ${c.mood ?? 4}/6, Anxiety ${c.anxiety ?? 5}/10, Energy ${c.energy ?? 5}/10, Sleep ${c.sleep ?? 5}/10, Stress ${c.stress ?? 5}/10, Connection ${c.connection ?? 5}/10`
    ).join('\n');

    const prompt = `You are AURA's clinical psychological data scientist.
Analyze this user's emotional and somatic check-in trends with deep psychological acumen and relatable emotional humor.

User profile: ${userContext || 'Standard profile'}
Recent emotions: ${recentEmotions.join(', ') || 'seeking balance'}
Check-in timeline:
${checkinSummary || 'No check-ins yet; analyze standard 7-day baseline.'}

Generate exactly 4 psychological pattern observations with gentle, witty emotional humor that illuminates human behavioral quirks (e.g., how the brain invents problems when tired, or how physical movement changes mood).

Return ONLY a valid JSON object in this exact structure:
{
  "stabilityScore": 76,
  "summary": "One sentence psychological takeaway with warm, witty humor.",
  "observations": [
    {
      "tag": "TAG (e.g. SLEEP & NERVOUS SYSTEM)",
      "observation": "2-3 sentences of sharp, warm psychological observation with emotional humor.",
      "accent": "#14B8A6"
    }
  ]
}
No markdown blocks, only JSON.`;

    const aiResult = await createChatCompletion({
      messages: [
        { role: 'system', content: 'You are a psychological data analyst. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 650,
    });

    if (aiResult.success) {
      try {
        const cleaned = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.observations && Array.isArray(parsed.observations) && parsed.observations.length >= 4) {
          return NextResponse.json({
            stabilityScore: parsed.stabilityScore || 78,
            summary: parsed.summary || 'Your emotional rhythm shows clear signs of self-regulation and recovery.',
            observations: parsed.observations.slice(0, 4),
            modelUsed: aiResult.modelUsed,
          });
        }
      } catch (parseErr) {
        console.warn('[AURA-Journey] AI parse notice:', parseErr.message);
      }
    }

    return NextResponse.json({
      stabilityScore: 78,
      summary: 'Your emotional rhythm shows steady resilience with notable rebounds after rest and quiet expression.',
      observations: FALLBACK_OBSERVATIONS,
      isFallback: true,
    });
  } catch (err) {
    console.error('Journey analysis error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
