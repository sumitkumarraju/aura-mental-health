import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/ai-client';

const FALLBACK_PROMPTS = [
  {
    question: "Notice your shoulders and jaw right this second—are they relaxed, or are they currently defending a medieval fortress?",
    hint: "Physical tension is often the brain's way of holding what words haven't sorted out yet.",
  },
  {
    question: "What was the most ridiculous thing your anxiety tried to convince you of in the last 24 hours?",
    hint: "Naming cognitive catastrophizing out loud takes away about half of its spooky power.",
  },
  {
    question: "If today's mental weather was an unskippable forecast, what would you warn yourself about this evening?",
    hint: "Self-awareness lets you pack an umbrella before the storm arrives.",
  },
  {
    question: "What is one small kindness you offered someone—or desperately needed to offer yourself today?",
    hint: "Self-compassion is not a luxury; it's basic biological maintenance.",
  },
  {
    question: "Did you actually need to solve that problem right now, or was your brain just craving something to chew on?",
    hint: "The mind treats boredom like an emergency if you let it.",
  },
];

export async function GET() {
  try {
    let recentEmotions = [];
    let userName = 'Friend';

    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', user.id)
          .single();

        if (profile?.name) userName = profile.name;

        const { data: emotions } = await supabase
          .from('emotions')
          .select('emotion')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (emotions?.length > 0) {
          recentEmotions = emotions.map((e) => e.emotion);
        }
      }
    } catch (err) {
      console.warn('[AURA-Checkin-Prompt] Context notice:', err.message);
    }

    const prompt = `You are AURA — an emotion counselor who speaks with warmth, sharp psychological insight, and witty emotional humor.
Generate ONE reflective check-in question for ${userName}.
Their recent emotional themes: ${recentEmotions.join(', ') || 'seeking grounding'}.

Requirements:
- Question must be 1 sentence, thought-provoking, and infused with gentle emotional humor (playfully calling out human quirks like overthinking, perfectionism, or carrying tension).
- Include a 1-sentence psychological hint/takeaway that normalizes the feeling.
- Format: Return ONLY JSON:
{
  "question": "...",
  "hint": "..."
}`;

    const aiResult = await createChatCompletion({
      messages: [
        { role: 'system', content: 'Output pure JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    if (aiResult.success) {
      try {
        const cleaned = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.question) {
          return NextResponse.json({
            question: parsed.question,
            hint: parsed.hint || 'Checking in with yourself is an act of gentle courage.',
            modelUsed: aiResult.modelUsed,
          });
        }
      } catch (parseErr) {
        console.warn('[AURA-Checkin-Prompt] Parse notice:', parseErr.message);
      }
    }

    const randomFallback = FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
    return NextResponse.json(randomFallback);
  } catch (err) {
    console.error('Checkin prompt error:', err);
    return NextResponse.json(FALLBACK_PROMPTS[0]);
  }
}
