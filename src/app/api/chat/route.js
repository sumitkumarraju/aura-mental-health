import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createChatCompletion, AURA_PSYCHOLOGICAL_COUNSELOR_PROMPT } from '@/lib/ai-client';

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'want to die', 'end my life',
  'hurt myself', 'self harm', 'cutting myself',
  "don't want to live", 'better off dead',
];

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

function deriveActionsFromResponse(text) {
  const lower = text.toLowerCase();
  const actions = [];

  if (lower.includes('breath') || lower.includes('calm') || lower.includes('nervous system') || lower.includes('shoulders')) {
    actions.push({ label: 'Box Breathing (Calm)', action: 'calm' });
  }
  if (lower.includes('write') || lower.includes('journal') || lower.includes('page') || lower.includes('thought')) {
    actions.push({ label: 'Write in Journal', action: 'journal' });
  }
  if (lower.includes('connect') || lower.includes('friend') || lower.includes('talk') || lower.includes('reach out')) {
    actions.push({ label: 'View Support Circle', action: 'action' });
  }
  if (lower.includes('walk') || lower.includes('move') || lower.includes('step away')) {
    actions.push({ label: 'Mindful Step', action: 'break' });
  }

  if (actions.length === 0) {
    actions.push(
      { label: 'Unpack this feeling', action: 'reflect' },
      { label: 'Take a quiet pause', action: 'calm' }
    );
  }

  return actions.slice(0, 3);
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

    // Fetch user context from Supabase for personalized psychological counseling
    let userContext = '';
    let userId = null;

    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;

        // Get profile preferences
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, what_helps, what_doesnt_help, support_style')
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

        // Get recent checkin dimensions
        const { data: recentCheckins } = await supabase
          .from('checkins')
          .select('energy, sleep_quality, note, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (profile) {
          userContext += `\nUser's name: ${profile.name || 'Friend'}`;
          userContext += `\nSupport style preference: ${profile.support_style || 'listen'}`;
          if (profile.what_helps?.length > 0) {
            userContext += `\nThings that help this user: ${profile.what_helps.join(', ')}`;
          }
          if (profile.what_doesnt_help?.length > 0) {
            userContext += `\nThings that DO NOT help: ${profile.what_doesnt_help.join(', ')}`;
          }
        }

        if (recentEmotions?.length > 0) {
          const emotionSummary = recentEmotions.map((e) => e.emotion).join(', ');
          userContext += `\nRecent emotions (last 7 days): ${emotionSummary}`;
        }

        if (recentCheckins?.length > 0) {
          const checkinSummary = recentCheckins
            .map((c) => `Energy: ${c.energy || '?'}/5, Sleep: ${c.sleep_quality || '?'}/5`)
            .join(' | ');
          userContext += `\nRecent check-in stats: ${checkinSummary}`;
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
    } catch (err) {
      console.warn('[AURA-Chat] Supabase context retrieval notice:', err.message);
    }

    // Build messages array
    const systemPromptWithContext = `${AURA_PSYCHOLOGICAL_COUNSELOR_PROMPT}${
      userContext ? `\n\nUSER'S PSYCHOLOGICAL CONTEXT & HISTORY:\n${userContext}` : ''
    }${mode === 'listen' ? '\n\nCURRENT MODE: Deep Listening. Minimize humor and advice; focus on quiet, spacious emotional validation.' : ''}`;

    const messages = [
      { role: 'system', content: systemPromptWithContext },
      { role: 'user', content: message },
    ];

    // Call resilient AI client
    const aiResult = await createChatCompletion({
      messages,
      temperature: 0.75,
      max_tokens: 380,
    });

    if (!aiResult.success) {
      console.warn('[AURA-Chat] Remote AI unavailable, signaling client demo fallback:', aiResult.error);
      return NextResponse.json({ useDemoMode: true });
    }

    const aiMessage = aiResult.content;
    const actions = deriveActionsFromResponse(aiMessage);

    // Save AI response to DB
    if (userId && sessionId) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          user_id: userId,
          role: 'aura',
          content: aiMessage,
        });
      } catch (saveErr) {
        console.warn('[AURA-Chat] DB save notice:', saveErr.message);
      }
    }

    return NextResponse.json({
      response: aiMessage,
      isSafetyAlert: false,
      actions,
      modelUsed: aiResult.modelUsed,
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

