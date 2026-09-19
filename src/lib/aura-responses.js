// AURA — Demo conversation response engine
// Emotion-aware branching logic for simulated conversations with continuity and safety checks

import { getProfile, getCheckins, getEmotionHistory } from './storage';

const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'want to die',
  'end my life',
  'hurt myself',
  'self harm',
  'cutting myself',
  'don\'t want to live',
  'better off dead',
];

const EMOTION_RESPONSES = {
  anxious: [
    "What does your mind keep returning to right now?",
    "Is it a specific worry, or more of a general feeling that something isn't right?",
    "When did you start noticing the anxiety? Was there something that triggered it?",
    "What does the anxiety feel like in your body right now?",
    "Is there something tomorrow, or in the near future, that's weighing on you?",
  ],
  sad: [
    "I'm here with you. Can you tell me a little about what's making you feel this way?",
    "Has something happened recently, or is this more of a lingering feeling?",
    "When you feel sad like this, what do you usually want?",
    "Is there someone or something you're missing right now?",
    "What would feel comforting to you in this moment?",
  ],
  lonely: [
    "Loneliness can be really heavy. When did it start feeling this way?",
    "Do you feel lonely because you're alone, or lonely even around people?",
    "Is there someone you wish you could talk to right now?",
    "What kind of connection would feel meaningful to you today?",
    "Sometimes loneliness is about being understood, not just being around people. Does that resonate?",
  ],
  overwhelmed: [
    "That's a lot to carry. What feels like the heaviest part right now?",
    "Would it help to name the things that are overwhelming you, one by one?",
    "Is there one thing we could take off the pile, even temporarily?",
    "Do you want help thinking through this, or do you just need space to breathe?",
    "You don't have to solve everything right now. What's the very next thing you need?",
  ],
  angry: [
    "Anger usually shows up when something matters to us. What happened?",
    "Is this a new feeling, or has it been building for a while?",
    "What would feel fair or right to you in this situation?",
    "Sometimes under anger there's hurt, or frustration, or fear. Does any of that feel true?",
    "What do you need right now — to vent, to be understood, or to think it through?",
  ],
  happy: [
    "That's really wonderful to hear. What's contributing to that feeling?",
    "Enjoy this moment — you've earned it. What made today good?",
    "Is there something specific that happened, or is it more of a general lightness?",
    "What does happiness feel like for you right now?",
    "I'd love to remember this — what's making you smile?",
  ],
  empty: [
    "Feeling empty can be its own kind of hard. How long have you been feeling this way?",
    "Is it a numbness, or more like something is missing that you can't name?",
    "Has anything felt meaningful to you lately, even something small?",
    "Sometimes emptiness comes when we've been running on fumes for too long. Does that sound right?",
    "What's the last thing that made you feel something?",
  ],
  stressed: [
    "What's the biggest source of stress right now?",
    "Is this a temporary situation, or something that's been ongoing?",
    "How is the stress showing up — in your thoughts, your body, or both?",
    "What would it look like for things to feel even slightly more manageable?",
    "If you could change one thing right now, what would it be?",
  ],
  calm: [
    "That's a good place to be. What helped you get here?",
    "Is there anything you'd like to reflect on while you're in this space?",
    "Would you like to capture how you're feeling, so you can come back to it later?",
  ],
  okay: [
    "Okay is okay. Is there anything underneath that you want to explore?",
    "Sometimes 'okay' means 'I don't want to think about it.' Is that what's happening?",
    "Is there anything that would make today feel a little better than just okay?",
  ],
};

const GENERIC_RESPONSES = [
  "Tell me more about that. Take all the time you need.",
  "How long have you been carrying this?",
  "What would help you the most right now in this exact moment?",
  "I'm listening. There's no pressure to make sense right away.",
  "That sounds heavy. You don't have to navigate it all alone.",
  "What does that feel like for you underneath the surface?",
  "I hear you. What feels like the very next thing you need?",
  "Thank you for trusting this space with that.",
];

const LISTEN_MODE_RESPONSES = [
  "I'm here. No advice, no judgment.",
  "I hear you.",
  "Take your time. You don't have to explain anything.",
  "I'm with you in this space.",
  "That makes complete sense.",
  "I'm listening.",
  "You're allowed to feel that.",
  "There is no rush.",
];

// Contextual action sets as specified in spec section 2
export const CONTEXTUAL_ACTIONS = {
  initial: [
    { label: 'Talk about it', action: 'talk' },
    { label: 'Help me understand', action: 'understand' },
    { label: 'Calm me down', action: 'calm' },
    { label: 'Just listen', action: 'listen' },
  ],
  anxious_overwhelmed: [
    { label: 'Help me understand', action: 'understand' },
    { label: 'Calm me down', action: 'calm' },
    { label: 'Give me something to do', action: 'action' },
    { label: 'Just listen', action: 'listen' },
    { label: 'Change the subject', action: 'change' },
  ],
  exploring: [
    { label: 'Talk about it', action: 'talk' },
    { label: 'Help me understand', action: 'understand' },
    { label: 'Give me something to do', action: 'action' },
    { label: 'Change the subject', action: 'change' },
  ],
  reflective: [
    { label: 'Just listen', action: 'listen' },
    { label: 'Talk about it', action: 'talk' },
    { label: 'Help me understand', action: 'understand' },
    { label: 'Calm me down', action: 'calm' },
  ],
};

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectEmotion(text) {
  const lower = text.toLowerCase();
  const emotionKeywords = {
    anxious: ['anxious', 'anxiety', 'worried', 'worry', 'nervous', 'scared', 'fear', 'afraid', 'panic', 'dread', 'tomorrow'],
    sad: ['sad', 'crying', 'cry', 'depressed', 'down', 'unhappy', 'miserable', 'miss', 'missing', 'grief', 'loss', 'hurt'],
    lonely: ['lonely', 'alone', 'isolated', 'nobody', 'no one', 'abandoned', 'disconnected'],
    overwhelmed: ['overwhelmed', 'too much', 'can\'t handle', 'drowning', 'exhausted', 'everything', 'so much', 'pile up'],
    angry: ['angry', 'furious', 'mad', 'frustrated', 'rage', 'annoyed', 'irritated', 'unfair', 'hate'],
    happy: ['happy', 'good', 'great', 'wonderful', 'amazing', 'better', 'smile', 'grateful', 'thankful', 'joy'],
    empty: ['empty', 'nothing', 'numb', 'hollow', 'flat', 'blank', 'void', 'meaningless'],
    stressed: ['stressed', 'stress', 'pressure', 'deadline', 'busy', 'overworked', 'tension'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'quiet', 'content'],
    okay: ['okay', 'fine', 'alright', 'meh', 'so-so'],
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return emotion;
    }
  }
  return null;
}

export function getAuraResponse(message, conversationLength = 0, mode = 'default') {
  // 1. Safety check
  if (detectCrisis(message)) {
    return {
      text: "I want to pause and make sure you're safe right now. What you're carrying sounds deeply overwhelming, and you deserve human, professional support right now. Please reach out to someone who can help immediately.",
      isSafetyAlert: true,
      actions: [
        { label: 'View Crisis Resources', action: 'crisis_help' },
        { label: 'Call Emergency Support', action: 'emergency' },
      ],
    };
  }

  // 2. Listen mode
  if (mode === 'listen') {
    const idx = conversationLength % LISTEN_MODE_RESPONSES.length;
    return {
      text: LISTEN_MODE_RESPONSES[idx],
      actions: [
        { label: 'Talk about it', action: 'talk' },
        { label: 'Calm me down', action: 'calm' },
        { label: 'Change the subject', action: 'change' },
      ],
    };
  }

  const emotion = detectEmotion(message);

  // 3. Continuity check (e.g. referencing user profile / previous checkins)
  if (conversationLength === 1) {
    const profile = getProfile();
    if (emotion === 'overwhelmed' && profile?.whatHelps?.length > 0) {
      return {
        text: `You mentioned earlier that ${profile.whatHelps[0].toLowerCase()} usually helps when you feel overwhelmed. Would you like to pause and explore that, or keep talking through what's happening?`,
        actions: CONTEXTUAL_ACTIONS.anxious_overwhelmed,
        detectedEmotion: emotion,
      };
    }
  }

  // 4. Emotional response with adaptive contextual actions
  if (emotion) {
    const pool = EMOTION_RESPONSES[emotion] || GENERIC_RESPONSES;
    const idx = conversationLength % pool.length;
    const isAnxiousOrOverwhelmed = ['anxious', 'overwhelmed', 'stressed'].includes(emotion);

    return {
      text: pool[idx],
      actions: isAnxiousOrOverwhelmed
        ? CONTEXTUAL_ACTIONS.anxious_overwhelmed
        : CONTEXTUAL_ACTIONS.exploring,
      detectedEmotion: emotion,
    };
  }

  // 5. Default progressive responses
  const idx = conversationLength % GENERIC_RESPONSES.length;
  return {
    text: GENERIC_RESPONSES[idx],
    actions: CONTEXTUAL_ACTIONS.reflective,
  };
}

export function getInitialMessage() {
  const profile = getProfile();
  const name = profile?.name ? `, ${profile.name}` : '';
  return {
    text: `I'm here whenever you're ready${name}. You can write anything—what happened today, something you miss, or simply "I don't know what's wrong."`,
    actions: CONTEXTUAL_ACTIONS.initial,
  };
}
