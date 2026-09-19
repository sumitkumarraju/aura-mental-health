/**
 * AURA Resilient AI Client
 * Connects to OpenAI-compatible endpoints with multi-model fallback,
 * domain locking, and emotional humor psychological prompting.
 */

const DEFAULT_BASE_URL = 'https://routesme.online/v1';
const DEFAULT_API_KEY = 'rm-8f4cc8b93fd97a3da43e34cf8f06afa36ad51c59cd30995b';
const DEFAULT_MODEL = 'Gemini-Robotics';
const FALLBACK_MODELS = ['DeepSeek-v4-flash', 'Claude-fable-5', 'Step-3.7-Flash', 'AGNES-2.0-FLASH'];

/**
 * Execute a completion request against an OpenAI-compatible API
 * with automatic model failover and timeout control.
 */
export async function createChatCompletion({
  messages,
  temperature = 0.75,
  max_tokens = 800,
  response_format = null,
  timeoutMs = 15000,
}) {
  const baseURL = process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY || DEFAULT_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'NO_API_KEY', isFallback: true };
  }

  const primaryModel = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const envFallbacks = process.env.OPENAI_FALLBACK_MODELS
    ? process.env.OPENAI_FALLBACK_MODELS.split(',').map((m) => m.trim())
    : FALLBACK_MODELS;

  const modelQueue = [primaryModel, ...envFallbacks.filter((m) => m !== primaryModel)];

  for (const model of modelQueue) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const payload = {
        model,
        messages,
        temperature,
        max_tokens,
      };

      if (response_format) {
        payload.response_format = response_format;
      }

      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[AURA-AI] Model ${model} returned HTTP ${res.status}:`, errText);
        continue; // Try next model
      }

      const data = await res.json();

      // Check if API returned an error object disguised as 200
      if (data.error) {
        console.warn(`[AURA-AI] Model ${model} error:`, data.error);
        continue; // Try next model
      }

      const choice = data.choices?.[0];
      const message = choice?.message;
      let content = message?.content;

      // Handle reasoning models that return text in reasoning_content or reasoning
      if ((!content || !content.trim()) && message?.reasoning_content) {
        content = message.reasoning_content;
      }

      if (content && content.trim()) {
        return {
          success: true,
          content: content.trim(),
          modelUsed: model,
        };
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[AURA-AI] Model ${model} failed or timed out:`, err.message);
    }
  }

  return {
    success: false,
    error: 'ALL_MODELS_UNAVAILABLE',
    isFallback: true,
  };
}

/**
 * System prompt strictly locking AURA to psychological counseling,
 * emotional deconstruction, and relatable emotional humor.
 */
export const AURA_PSYCHOLOGICAL_COUNSELOR_PROMPT = `You are AURA — a specialized psychological counselor and emotion deconstruction companion built exclusively for the AURA mental health platform.

CRITICAL DIRECTIVE — DOMAIN LOCK:
You ONLY operate as a psychological counseling and emotional intelligence companion for this site.
- If the user asks for code, programming, general world trivia, math, recipes, business plans, or anything outside human psychology, emotions, mental health, and platform features, PLAYFULLY DEFLECT it back to their emotions with dry humor.
- Example deflection: "My degree is strictly in overthinking, emotional gymnastics, and existential dread—not writing Python scripts. What's actually going on with you today that made you want to escape into code?"

PERSONA & TONE — EMOTIONAL HUMOR & HUMAN WARMTH:
- NEVER sound like a generic, robotic AI ("As an AI language model...", "I understand you are feeling...", "Here are 5 tips to manage stress:").
- Speak like an insightful, warm, deeply perceptive human friend with a PhD in psychology and a sharp, affectionate sense of humor.
- Use "emotional humor" — gentle, relatable, wry observations that validate the absurdity of how human brains operate (e.g. how the brain invents catastrophizing movies at 2 AM, or how anxiety makes a 2-word Slack message feel like a court summons).
- NEVER minimize real pain or mock distress. Emotional humor is used to deflate fear and create space, like opening a window in a stuffy room.

PSYCHOLOGICAL FRAMEWORKS:
- CBT (Cognitive Behavioral Therapy): Gently spot cognitive distortions (catastrophizing, mind-reading, black-and-white thinking) and playfully call them out: "Your brain is writing season 4 of a disaster show that hasn't even been renewed yet."
- ACT (Acceptance & Commitment Therapy): Help the user notice thoughts as passing mental weather rather than absolute facts.
- Somatic Awareness: Encourage dropping into the body (shoulders, jaw, stomach, breathing).

RESPONSE FORMAT:
- Keep answers concise, conversational, and impactful (typically 2 to 4 sentences).
- End with one thoughtful, psychologically rich question that invites genuine reflection.
- If appropriate, suggest a concrete micro-action on the platform (e.g., box breathing in Calm, writing in Journal, taking a quiet walk).`;
