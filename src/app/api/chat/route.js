import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'want to die', 'end my life',
  'hurt myself', 'self harm', 'cutting myself',
  "don't want to live", 'better off dead',
];

const AURA_SYSTEM_PROMPT = `You are AURA — an emotion-aware AI companion for a mental health support platform. You are NOT a therapist, NOT a medical professional, and NOT a crisis hotline.

Your role:
- Listen empathetically and reflect back what the user is feeling
- Ask thoughtful follow-up questions that help the user understand their emotions
- Never diagnose, prescribe, or give medical advice
- Reference the user's profile preferences when available (what helps them, their support style)
- Keep responses conversational, warm, and under 3 sentences
- Use the user's name naturally when appropriate
- If the user seems to want advice, gently reframe toward self-discovery ("What do you think might help?" rather than "You should...")

Safety rules:
- If the user mentions self-harm, suicide, or crisis situations, IMMEDIATELY respond with empathy and direct them to professional help
- Never roleplay as a doctor, therapist, or emergency responder
- Never minimize the user's feelings

Personality: Warm, gentle, non-judgmental, curious. Think of a deeply empathetic friend who asks the right questions.`;

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, sessionId, mode = 'default' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Crisis detection (server-side, before any AI call)
    if (detectCrisis(message)) {
      return NextResponse.json({
        response: "I want to pause and make sure you're safe right now. What you're carrying sounds deeply overwhelming, and you deserve human, professional support. Please reach out to someone who can help immediately.",
        isSafetyAlert: true,
        actions: [
          { label: 'View Crisis Resources', action: 'crisis_help' },
          { label: 'Call Emergency Support', action: 'emergency' },
        ],
      });
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // No API key — return a signal to use client-side demo responses
      return NextResponse.json({ useDemoMode: true });
    }

    // Fetch user context from Supabase for personalized responses
    let userContext = '';
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, what_helps, support_style')
          .eq('user_id', user.id)
          .single();

        // Get recent emotions (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: recentEmotions } = await supabase
          .from('emotions')
          .select('emotion, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (profile) {
          userContext += `\nUser's name: ${profile.name || 'Unknown'}`;
          userContext += `\nSupport style preference: ${profile.support_style || 'listen'}`;
          if (profile.what_helps?.length > 0) {
            userContext += `\nThings that help this user: ${profile.what_helps.join(', ')}`;
          }
        }

        if (recentEmotions?.length > 0) {
          const emotionSummary = recentEmotions.map((e) => e.emotion).join(', ');
          userContext += `\nRecent emotions (last 7 days): ${emotionSummary}`;
        }

        // Save user message to DB
        if (sessionId) {
          await supabase.from('chat_messages').insert({
            session_id: sessionId,
            user_id: user.id,
            role: 'user',
            content: message,
          });
        }
      }
    } catch {
      // Supabase not configured — proceed without user context
    }

    // Build messages array for OpenAI
    const messages = [
      {
        role: 'system',
        content: AURA_SYSTEM_PROMPT + (userContext ? `\n\nUser Context:\n${userContext}` : ''),
      },
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error('OpenAI error:', errText);
      return NextResponse.json({ useDemoMode: true });
    }

    const data = await openaiResponse.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';

    // Save AI response to DB
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && sessionId) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'aura',
          content: aiMessage,
        });
      }
    } catch {
      // Ignore DB save errors — response is still valid
    }

    return NextResponse.json({
      response: aiMessage,
      isSafetyAlert: false,
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
