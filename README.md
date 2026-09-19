# AURA — Adaptive Understanding & Response Architecture

> **A private, emotion-aware mental-health support platform.**  
> Built as a calm, personal emotional sanctuary — not a clinical dashboard, diagnostic tool, or generic chatbot.

![AURA Logo](/public/images/aura_logo.jpg)

---

## 🌟 Vision & Philosophy

Most mental health apps feel either like sterile medical charts or repetitive chatbots. **AURA** is designed as an intimate emotional sanctuary that adapts to how you feel in the moment.

The entire product revolves around an effortless, cyclical user journey:
```
Check in ➔ Express ➔ Understand ➔ Talk ➔ Personalize ➔ Take a small step ➔ Reflect ➔ Learn
```

### Core Tenets
- **Non-Clinical & Empathetic**: A warm, compassionate companion that listens and asks thoughtful questions without diagnosing or prescribing.
- **Privacy & Offline-First**: All data is stored locally on-device by default. When authenticated, data syncs securely to Supabase with Row Level Security (RLS).
- **Awwwards-Level Aesthetics**: Cinematic ambient lighting, fluid dynamic glassmorphism (40px blur), tailored typography, and bespoke 3D abstract imagery.
- **Safety First**: Proactive server-side crisis detection that immediately routes users to emergency resources if distress or self-harm keywords are detected.

---

## ✨ Features

### 1. 🌅 Home / "Today"
- **Time-Aware Greeting**: Gentle greeting tailored to time of day (*"Good evening, Sumit. You don't have to figure everything out today."*).
- **Emotion Check-In**: Quick emotional selection across 10 core states (*Calm, Anxious, Overwhelmed, Reflective, Sad, Lonely, Happy, Angry, Empty, Stressed*).
- **Bento Grid Dashboard**: High-level snapshot of recent patterns, calming exercises, and today's support.

### 2. 💬 AURA Companion (Chat)
- **Two Distinct Modes**:
  - **Conversation Mode**: Empathetic dialogue with thoughtful follow-up questions and self-discovery reframing.
  - **Listening Mode**: Pure silent presence (*"I'm here. No advice, no judgment."*).
- **Safety Guardrails**: Real-time crisis keyword detection that surfaces emergency contacts and crisis hotlines immediately.
- **Context-Aware**: Injects user preferences (*what helps, what doesn't help*) and recent 7-day emotional history into conversations.

### 3. 📝 Structured Daily Check-In
- Somatic tracking (*tight chest, clenched jaw, shallow breathing*).
- Energy level (1-5) and sleep quality (1-5) tracking.
- Contextual reflection notes.

### 4. 📈 Emotional Journey
- Visual trajectory of emotional states over the past 7 to 30 days.
- Time-of-day pattern analysis (*e.g., higher anxiety in mornings, calm in late evenings*).
- Interactive mood distribution metrics.

### 5. 🌿 Calm Space & Grounding
- **Box Breathing Engine**: Guided visual breathing circle (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s) with parasympathetic calming feedback.
- **5-4-3-2-1 Sensory Grounding**: Step-by-step interactive re-orientation to restore nervous system equilibrium.
- **Ambient Soundscapes**: Built-in soothing white noise, rainfall, and deep ambient sound frequencies.

### 6. 📖 Private Journal
- Distraction-free, encrypted writing space.
- Mood tagging, bookmarking, and search.
- Thoughtful writing prompts tailored to emotional states.

### 7. 🛡️ Support Tasks & Safety Network
- **Daily Micro-Actions**: 3 personalized small steps per day (e.g., *Connect with a friend, Box breathing, Mindful walk*).
- **Trusted Contacts**: Emergency and support contact directory with one-tap calling.
- **Crisis Directory**: Immediate access to international and regional crisis helplines (Tele-MANAS, Vandrevala Foundation, iCall, 988 Lifeline).

---

## 🎨 Visual Design System

- **Background Canvas**: Deep cinematic void (`#050505`) with ambient radial color bleeds.
- **Glassmorphism**: Multi-layered `.glass-panel` components with 40px backdrop blur, translucent borders, and subtle inner specular lighting.
- **Curated Color Palette**:
  - `Accent Teal`: `#14B8A6` (Calm & Grounded)
  - `Accent Amber`: `#F59E0B` (Warmth & Energy)
  - `Accent Purple`: `#8B5CF6` (Introspection & Journaling)
  - `Accent Rose`: `#EC4899` (Social & Heart Connection)
- **Typography**:
  - Display: **Outfit** (Light weights: 200/300)
  - Body: **Inter** (Clean readability)
  - Monospace: **JetBrains Mono** (Micro-labels & tags)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | React 19, [Motion](https://motion.dev/) (Framer Motion) |
| **Icons** | [@phosphor-icons/react](https://phosphoricons.com/) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL 17, Row Level Security) |
| **Authentication** | Supabase SSR Auth (Email/Password, Magic Link, OAuth) |
| **Styling** | Vanilla CSS Design Tokens (Zero Tailwind overhead for maximum fidelity) |
| **AI Integration** | OpenAI GPT-4o-mini (Server-side API routes with local fallback) |

---

## 🗄️ Database Architecture (Supabase)

The project includes 10 PostgreSQL tables with full Row Level Security (RLS) policies:

```
├── profiles             # User preferences, support style, "what helps"
├── emotions             # Emotion check-in logs with intensity ratings (1-10)
├── checkins             # Daily somatic, energy, and sleep records
├── journal_entries      # Encrypted private journal reflections
├── chat_sessions        # Conversation session metadata & mode
├── chat_messages        # Complete message history with emotion tags
├── support_tasks        # Daily personalized micro-actions
├── trusted_contacts     # Safety network & emergency contacts
├── support_templates    # Global catalog of exercises & routines
└── emotion_definitions  # Emotion taxonomy and color mappings
```

### Row Level Security (RLS)
Every user table enforces:
```sql
CREATE POLICY "Users can only access own data" ON public.<table_name>
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm, pnpm, or bun

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/aura-mental-health.git
cd aura-mental-health
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Optional — leave blank for local rule-based engine)
OPENAI_API_KEY=
```

### 3. Run Migrations & Seed Data
Execute the SQL in `supabase/migration.sql` in your Supabase SQL editor, or run the automated seed script:
```bash
node supabase/seed.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view AURA.

---

## ☁️ Deployment on Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add the following environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (Optional)
4. Click **Deploy**.

---

## 📄 License
MIT License. Built with care for human emotional wellbeing.
