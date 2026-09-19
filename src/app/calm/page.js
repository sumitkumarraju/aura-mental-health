'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Leaf,
  Wind,
  HandEye,
  Hourglass,
  SpeakerHigh,
  SpeakerSlash,
  ChatCircleDots,
  Trash,
  X,
  Play,
  Pause,
  ArrowCounterClockwise,
  FloppyDisk,
  Sparkle,
  Waves,
  CloudRain,
  Tree,
  Circle,
} from '@phosphor-icons/react';
import { saveJournalEntry } from '@/lib/storage';

// --- Web Audio Synthesizer for Ambient Soundscapes ---
class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.nodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    this.nodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch {}
    });
    this.nodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  play(type) {
    this.init();
    this.stop();
    this.isPlaying = true;
    this.currentTrack = type;

    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate White Noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.nodes.push(masterGain);

    if (type === 'rain') {
      // Rain: filtered noise with high cut
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.setValueAtTime(300, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(filter2);
      filter2.connect(masterGain);
      whiteNoise.start();
      this.nodes.push(whiteNoise, filter, filter2);
    } else if (type === 'ocean') {
      // Ocean Waves: modulated lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      // LFO for wave motion
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(350, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      lfo.start();
      whiteNoise.start();
      this.nodes.push(whiteNoise, filter, lfo, lfoGain);
    } else if (type === 'forest') {
      // Forest Wind: resonant bandpass
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(200, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      lfo.start();
      whiteNoise.start();
      this.nodes.push(whiteNoise, filter, lfo, lfoGain);
    } else if (type === 'drone') {
      // Deep 432Hz meditative drone
      const freqs = [108, 216, 432];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        this.nodes.push(osc, oscGain);
      });
    }
  }
}

let soundEngine = null;

// --- Breathing Component ---
function BreathingExercise({ onClose }) {
  const [phase, setPhase] = useState('Inhale');
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const cycle = ['Inhale', 'Hold', 'Exhale', 'Rest'];
    const times = [4000, 4000, 4000, 4000]; // Box breathing

    let timeout;
    const runCycle = () => {
      setPhase(cycle[current]);
      if (current === 3) setCycleCount((c) => c + 1);
      timeout = setTimeout(() => {
        current = (current + 1) % cycle.length;
        runCycle();
      }, times[current]);
    };
    runCycle();

    return () => clearTimeout(timeout);
  }, []);

  const scale = phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : phase === 'Exhale' ? 0.9 : 0.9;
  const opacity = phase === 'Inhale' || phase === 'Hold' ? 0.8 : 0.3;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3, 3, 3, 0.95)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button className="btn btn--glass" style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', zIndex: 101, borderRadius: '50%', width: 48, height: 48, padding: 0 }} onClick={onClose}>
        <X size={24} weight="light" />
      </button>

      <div style={{ position: 'relative', width: 320, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale, opacity }}
          transition={{ duration: 4, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-teal) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />
        <div style={{ zIndex: 2, textAlign: 'center' }}>
          <motion.h2
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="display-text"
            style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-2)' }}
          >
            {phase}
          </motion.h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
            CYCLE {cycleCount + 1} • 4 SECONDS
          </p>
        </div>
      </div>
      <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-8)', fontSize: 'var(--text-sm)' }}>
        Follow the rhythm. There is nothing else you need to do right now.
      </p>
    </div>
  );
}

// --- Grounding Component ---
function GroundingExercise({ onClose }) {
  const steps = [
    { num: 5, text: "Things you can see", desc: "Look around your space. Notice small details: light patterns, textures, shadows." },
    { num: 4, text: "Things you can physically feel", desc: "The sensation of your feet on the floor, the fabric against your skin, your breath." },
    { num: 3, text: "Things you can hear", desc: "Listen carefully. Ambient hum, distant cars, or the sound of silence." },
    { num: 2, text: "Things you can smell", desc: "Notice the air around you, coffee, rain, or simply your own scent." },
    { num: 1, text: "Good thing about yourself", desc: "A quality, a small kindness you offered, or simply that you are here right now." },
  ];
  const [step, setStep] = useState(0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3, 3, 3, 0.95)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button className="btn btn--glass" style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', zIndex: 101, borderRadius: '50%', width: 48, height: 48, padding: 0 }} onClick={onClose}>
        <X size={24} weight="light" />
      </button>

      <div style={{ maxWidth: 540, width: '100%', padding: 'var(--space-6)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-panel"
            style={{ padding: 'var(--space-8)', textAlign: 'center' }}
          >
            <div style={{ fontSize: '110px', fontFamily: 'var(--font-display)', fontWeight: 100, color: 'var(--accent-calm)', lineHeight: 1, marginBottom: 'var(--space-2)' }}>
              {steps[step].num}
            </div>
            <h2 className="display-text" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>{steps[step].text}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', fontWeight: 300, marginBottom: 'var(--space-8)', lineHeight: 1.6 }}>{steps[step].desc}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
              {step > 0 && <button className="btn btn--glass" onClick={() => setStep(step - 1)}>Back</button>}
              {step < steps.length - 1 ? (
                <button className="btn btn--primary btn--glass" onClick={() => setStep(step + 1)}>Next</button>
              ) : (
                <button className="btn btn--primary btn--glass" onClick={onClose}>Complete Grounding</button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Thought Dump Component ---
function ThoughtDump({ onClose }) {
  const [thoughts, setThoughts] = useState('');
  const [isDissolving, setIsDissolving] = useState(false);
  const [actionDone, setActionDone] = useState(null);

  const handleLetGo = () => {
    setIsDissolving(true);
    setTimeout(() => {
      setThoughts('');
      setIsDissolving(false);
      setActionDone('released');
    }, 1200);
  };

  const handleSaveToJournal = () => {
    if (!thoughts.trim()) return;
    saveJournalEntry({
      id: Date.now().toString(),
      text: thoughts.trim(),
      prompt: 'Thought Dump from Calm Space',
      mode: 'calm_dump',
    });
    setActionDone('saved');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3, 3, 3, 0.95)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button className="btn btn--glass" style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', zIndex: 101, borderRadius: '50%', width: 48, height: 48, padding: 0 }} onClick={onClose}>
        <X size={24} weight="light" />
      </button>

      <div style={{ maxWidth: 680, width: '100%', padding: 'var(--space-6)' }}>
        <div className="glass-panel" style={{ padding: 'var(--space-7)' }}>
          <h2 className="display-text" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Thought Dump</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 300, marginBottom: 'var(--space-6)' }}>
            A distraction-free place to empty whatever is spinning in your head. You can let it dissolve or keep it private.
          </p>

          <AnimatePresence>
            {actionDone === 'released' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <Sparkle size={48} style={{ color: 'var(--accent-teal)', margin: '0 auto var(--space-4)' }} />
                <h3 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Let it go into the quiet.</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Those thoughts have left your screen. Breathe easy.</p>
                <button className="btn btn--glass" style={{ marginTop: 'var(--space-6)' }} onClick={() => setActionDone(null)}>Write More</button>
              </motion.div>
            ) : actionDone === 'saved' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <FloppyDisk size={48} style={{ color: 'var(--accent-green)', margin: '0 auto var(--space-4)' }} />
                <h3 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>Saved securely to your journal.</h3>
              </motion.div>
            ) : (
              <motion.div
                animate={isDissolving ? { opacity: 0, filter: 'blur(20px)', y: -20, scale: 0.95 } : { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                transition={{ duration: 1.2 }}
              >
                <textarea
                  className="input-glass"
                  placeholder="Pour it all out here... no formatting, no judgment."
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    fontSize: 'var(--text-base)',
                    lineHeight: 1.7,
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    marginBottom: 'var(--space-4)',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn--glass"
                    onClick={handleLetGo}
                    disabled={!thoughts.trim() || isDissolving}
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <Trash size={16} /> Let it dissolve
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary btn--glass"
                    onClick={handleSaveToJournal}
                    disabled={!thoughts.trim() || isDissolving}
                  >
                    <FloppyDisk size={16} /> Save to Journal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Focus Timer Component ---
function FocusTimer({ onClose }) {
  const [duration, setDuration] = useState(300); // 5 min default
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const selectDuration = (sec) => {
    setDuration(sec);
    setTimeLeft(sec);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / duration) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3, 3, 3, 0.95)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button className="btn btn--glass" style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', zIndex: 101, borderRadius: '50%', width: 48, height: 48, padding: 0 }} onClick={onClose}>
        <X size={24} weight="light" />
      </button>

      <div style={{ maxWidth: 480, width: '100%', padding: 'var(--space-6)', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: 'var(--space-8)' }}>
          <h2 className="display-text" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Focus & Quiet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 300, marginBottom: 'var(--space-6)' }}>
            A short quiet timer to be still without digital notifications.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-7)' }}>
            {[120, 300, 600, 900].map((sec) => (
              <button
                key={sec}
                className="btn btn--glass"
                onClick={() => selectDuration(sec)}
                style={{
                  fontSize: 'var(--text-xs)',
                  background: duration === sec ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderColor: duration === sec ? 'var(--accent-warm)' : 'var(--border-subtle)',
                }}
              >
                {sec / 60}m
              </button>
            ))}
          </div>

          {/* Circular Visualizer */}
          <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto var(--space-7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="110" cy="110" r="95" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <motion.circle
                cx="110"
                cy="110"
                r="95"
                stroke="var(--accent-warm)"
                strokeWidth="6"
                strokeDasharray={596}
                strokeDashoffset={596 - (596 * progress) / 100}
                fill="transparent"
                strokeLinecap="round"
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span className="display-text" style={{ fontSize: 'var(--text-5xl)', fontFamily: 'var(--font-mono)', fontWeight: 200 }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <button
              className="btn btn--primary btn--glass"
              onClick={() => setIsRunning(!isRunning)}
              style={{ minWidth: 120 }}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />} {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              className="btn btn--glass"
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(duration);
              }}
            >
              <ArrowCounterClockwise size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Ambient Soundscapes Component ---
function SoundscapesModal({ onClose }) {
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    if (!soundEngine) {
      soundEngine = new SoundscapeEngine();
    }
    setActiveTrack(soundEngine.currentTrack);
  }, []);

  const handleToggle = (type) => {
    if (!soundEngine) soundEngine = new SoundscapeEngine();

    if (activeTrack === type) {
      soundEngine.stop();
      setActiveTrack(null);
    } else {
      soundEngine.play(type);
      setActiveTrack(type);
    }
  };

  const TRACKS = [
    { id: 'rain', label: 'Gentle Rain', desc: 'Soft rain falling on glass', icon: CloudRain, color: '#14B8A6' },
    { id: 'ocean', label: 'Ocean Waves', desc: 'Rhythmic, grounding shore tide', icon: Waves, color: '#8B5CF6' },
    { id: 'forest', label: 'Forest Wind', desc: 'Breeze through tall pines', icon: Tree, color: '#10B981' },
    { id: 'drone', label: '432Hz Harmony', desc: 'Deep soothing singing drone', icon: Circle, color: '#F59E0B' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3, 3, 3, 0.95)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button className="btn btn--glass" style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', zIndex: 101, borderRadius: '50%', width: 48, height: 48, padding: 0 }} onClick={onClose}>
        <X size={24} weight="light" />
      </button>

      <div style={{ maxWidth: 580, width: '100%', padding: 'var(--space-6)' }}>
        <div className="glass-panel" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div>
              <h2 className="display-text" style={{ fontSize: 'var(--text-3xl)' }}>Ambient Sounds</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 300, marginTop: 4 }}>
                Synthesized soothing soundscapes generated live in your browser.
              </p>
            </div>
            {activeTrack && (
              <button
                className="btn btn--glass"
                onClick={() => {
                  soundEngine?.stop();
                  setActiveTrack(null);
                }}
                style={{ color: 'var(--accent-rose)', fontSize: 'var(--text-xs)' }}
              >
                <SpeakerSlash size={16} /> Silence
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {TRACKS.map((t) => {
              const Icon = t.icon;
              const isPlaying = activeTrack === t.id;
              return (
                <button
                  key={t.id}
                  className="glass-panel"
                  onClick={() => handleToggle(t.id)}
                  style={{
                    padding: 'var(--space-5)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: isPlaying ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: isPlaying ? t.color : 'var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 120,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, color-mix(in srgb, ${t.color} 25%, transparent), transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color }}>
                      <Icon size={20} />
                    </div>
                    {isPlaying && (
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }}
                      />
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>{t.label}</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 300 }}>{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Calm Space Page ---
export default function CalmPage() {
  const [activeTool, setActiveTool] = useState(null);

  const CALM_TOOLS = [
    { id: 'breathe', label: 'Breathing', desc: 'Box breathing to regulate your nervous system', icon: Wind, color: '#14B8A6' },
    { id: 'ground', label: 'Grounding', desc: '5-4-3-2-1 sensory awareness exercise', icon: HandEye, color: '#8B5CF6' },
    { id: 'thought_dump', label: 'Thought Dump', desc: 'A quiet place to pour out your mind and let it go', icon: Trash, color: '#F43F5E' },
    { id: 'focus', label: 'Focus Timer', desc: 'Peaceful quiet timer without interruptions', icon: Hourglass, color: '#F59E0B' },
    { id: 'music', label: 'Ambient Sounds', desc: 'Rain, ocean waves, forest breeze, singing bowl', icon: SpeakerHigh, color: '#10B981' },
    { id: 'talk', label: 'Talk to AURA', desc: 'Return directly to a supportive listener', icon: ChatCircleDots, color: 'var(--text-primary)', isLink: true, href: '/chat?mode=listen' },
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(100dvh - var(--space-8)*2)' }}>
      <AnimatePresence>
        {activeTool === 'breathe' && <BreathingExercise onClose={() => setActiveTool(null)} />}
        {activeTool === 'ground' && <GroundingExercise onClose={() => setActiveTool(null)} />}
        {activeTool === 'thought_dump' && <ThoughtDump onClose={() => setActiveTool(null)} />}
        {activeTool === 'focus' && <FocusTimer onClose={() => setActiveTool(null)} />}
        {activeTool === 'music' && <SoundscapesModal onClose={() => setActiveTool(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', marginBottom: 'var(--space-5)' }}>
          <Leaf size={32} weight="thin" style={{ color: 'var(--accent-teal)' }} />
        </div>
        <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-3)' }}>Calm Space</h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', fontWeight: 300, marginBottom: 'var(--space-8)', maxWidth: 540, margin: '0 auto var(--space-8)' }}>
          A dedicated shelter for moments of emotional overwhelm. Choose what you need right now.
        </p>

        <div className="bento-grid">
          {CALM_TOOLS.map((tool, i) => {
            const Icon = tool.icon;

            if (tool.isLink) {
              return (
                <div key={tool.id} className="bento-item-third">
                  <Link href={tool.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    <div
                      className="glass-panel"
                      style={{
                        height: '100%',
                        padding: 'var(--space-7) var(--space-5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, color-mix(in srgb, ${tool.color} 20%, transparent), transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool.color }}>
                        <Icon size={28} weight="thin" />
                      </div>
                      <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-primary)' }}>{tool.label}</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.5 }}>{tool.desc}</p>
                    </div>
                  </Link>
                </div>
              );
            }

            return (
              <motion.div
                key={tool.id}
                className="bento-item-third"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  className="glass-panel"
                  onClick={() => setActiveTool(tool.id)}
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 'var(--space-7) var(--space-5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, color-mix(in srgb, ${tool.color} 20%, transparent), transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool.color }}>
                    <Icon size={28} weight="thin" />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-primary)' }}>{tool.label}</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.5 }}>{tool.desc}</p>
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
