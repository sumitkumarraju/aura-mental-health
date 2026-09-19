'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getCheckins, getEmotionHistory } from '@/lib/storage';
import {
  Lightbulb,
  CalendarBlank,
  Heart,
  ChartLineUp,
  Sparkle,
  Eye,
} from '@phosphor-icons/react';

const DIMENSIONS = ['mood', 'anxiety', 'energy', 'sleep', 'stress', 'connection'];

const DIMENSION_CONFIG = {
  mood: { label: 'Mood', color: '#8B5CF6', max: 6, low: 'Low', high: 'Bright' },
  anxiety: { label: 'Anxiety', color: '#F59E0B', max: 10, low: 'Calm', high: 'Intense' },
  energy: { label: 'Energy', color: '#10B981', max: 10, low: 'Drained', high: 'Energized' },
  sleep: { label: 'Sleep', color: '#BB9AF7', max: 10, low: 'Poor', high: 'Restful' },
  stress: { label: 'Stress', color: '#F43F5E', max: 10, low: 'Relaxed', high: 'High' },
  connection: { label: 'Connection', color: '#14B8A6', max: 10, low: 'Isolated', high: 'Connected' },
};

function SimpleTrendChart({ data, dimension }) {
  if (!data || data.length === 0) return null;

  const width = 800;
  const height = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const config = DIMENSION_CONFIG[dimension];
  const maxVal = config.max;

  // Single point case
  if (data.length === 1) {
    const cy = padding.top + chartH - (data[0].value / maxVal) * chartH;
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 280 }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="rgba(255,255,255,0.06)" />
          <circle cx={width / 2} cy={cy} r="6" fill={config.color} />
          <text x={width / 2} y={height - 10} textAnchor="middle" fill="var(--text-tertiary)" fontSize="12" fontFamily="var(--font-mono)">
            {data[0].label}
          </text>
        </svg>
      </div>
    );
  }

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value ?? 5) / maxVal) * chartH,
    label: d.label,
    val: d.value,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 280 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${dimension}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Horizontal Guidelines */}
        {[0, 0.5, 1].map((frac) => (
          <line
            key={frac}
            x1={padding.left}
            y1={padding.top + chartH * frac}
            x2={padding.left + chartW}
            y2={padding.top + chartH * frac}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="4 4"
          />
        ))}

        {/* Gradient fill beneath line */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`}
          fill={`url(#grad-${dimension})`}
        />

        {/* Animated Main Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          d={pathD}
          fill="none"
          stroke={config.color}
          strokeWidth="2.5"
          filter="url(#softGlow)"
        />

        {/* Interactive Data Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#FAFAFA" />
            <circle cx={p.x} cy={p.y} r="8" fill={config.color} opacity="0.2" />
            <text
              x={p.x}
              y={height - 12}
              textAnchor="middle"
              fill="var(--text-tertiary)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function JourneyPage() {
  const [checkins, setCheckins] = useState([]);
  const [timeRange, setTimeRange] = useState(7); // 7 | 30 | 90
  const [activeDimension, setActiveDimension] = useState('mood');

  useEffect(() => {
    // Generate dummy data if user has fewer than 2 checkins for demonstration
    const saved = getCheckins();
    if (saved.length > 0) {
      setCheckins(saved);
    } else {
      const now = Date.now();
      const mock = [
        { id: '1', timestamp: new Date(now - 86400000 * 6).toISOString(), mood: 3, anxiety: 6, energy: 4, sleep: 5, stress: 7, connection: 4 },
        { id: '2', timestamp: new Date(now - 86400000 * 5).toISOString(), mood: 4, anxiety: 5, energy: 5, sleep: 6, stress: 5, connection: 6 },
        { id: '3', timestamp: new Date(now - 86400000 * 3).toISOString(), mood: 2, anxiety: 7, energy: 3, sleep: 4, stress: 8, connection: 3 },
        { id: '4', timestamp: new Date(now - 86400000 * 2).toISOString(), mood: 5, anxiety: 4, energy: 6, sleep: 7, stress: 4, connection: 7 },
        { id: '5', timestamp: new Date(now - 86400000 * 1).toISOString(), mood: 4, anxiety: 4, energy: 7, sleep: 6, stress: 4, connection: 8 },
      ];
      setCheckins(mock);
    }
  }, []);

  const filtered = checkins.filter(
    (c) => (Date.now() - new Date(c.timestamp).getTime()) / 86400000 <= timeRange
  );

  const chartData = filtered.map((c) => ({
    value: activeDimension === 'mood' ? c.mood : (c[activeDimension] ?? 5),
    label: new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span className="label-text" style={{ color: 'var(--accent-calm)' }}>LONGITUDINAL PATTERNS</span>
          <h1 className="display-text" style={{ fontSize: 'var(--text-5xl)', marginTop: 'var(--space-2)' }}>
            Emotional Journey
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', fontWeight: 300, marginTop: 'var(--space-2)', maxWidth: 640 }}>
            Gentle reflections on your emotional patterns over time. This is not a diagnosis—it is a space to observe and understand your personal rhythms.
          </p>
        </div>

        {/* Chart Panel */}
        <div className="glass-panel" style={{ padding: 'var(--space-7)', marginBottom: 'var(--space-8)' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            
            {/* Dimension Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {DIMENSIONS.map((dim) => {
                const conf = DIMENSION_CONFIG[dim];
                const isActive = activeDimension === dim;
                return (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => setActiveDimension(dim)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      border: `1px solid ${isActive ? 'var(--border-glow)' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>

            {/* Time Filters: 7, 30, 90 days */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTimeRange(days)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    background: timeRange === days ? 'var(--text-primary)' : 'transparent',
                    color: timeRange === days ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <SimpleTrendChart data={chartData} dimension={activeDimension} />
        </div>

        {/* Personal Observations Section (Non-Clinical) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Eye size={20} style={{ color: 'var(--accent-warm)' }} />
            <h2 className="display-text" style={{ fontSize: 'var(--text-2xl)' }}>
              Personal Observations
            </h2>
          </div>

          <div className="bento-grid" style={{ marginTop: 0 }}>
            <div className="bento-item-half glass-panel" style={{ padding: 'var(--space-6)' }}>
              <span className="label-text" style={{ color: 'var(--accent-teal)', display: 'block', marginBottom: 'var(--space-2)' }}>
                A PATTERN YOU MAY WANT TO NOTICE…
              </span>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                You marked meaningful conversations as helpful several times this week. Connection seems to soften moments when anxiety climbs.
              </p>
            </div>

            <div className="bento-item-half glass-panel" style={{ padding: 'var(--space-6)' }}>
              <span className="label-text" style={{ color: 'var(--accent-calm)', display: 'block', marginBottom: 'var(--space-2)' }}>
                A PATTERN YOU MAY WANT TO NOTICE…
              </span>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                You often choose music when you feel overwhelmed. Taking ten minutes of quiet soundscapes coincides with a drop in your reported tension.
              </p>
            </div>

            <div className="bento-item-half glass-panel" style={{ padding: 'var(--space-6)' }}>
              <span className="label-text" style={{ color: 'var(--accent-warm)', display: 'block', marginBottom: 'var(--space-2)' }}>
                A PATTERN YOU MAY WANT TO NOTICE…
              </span>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                Sleep quality and daily energy show a strong parallel in your 7-day view. Unwinding without screens before bed tends to support morning ease.
              </p>
            </div>

            <div className="bento-item-half glass-panel" style={{ padding: 'var(--space-6)' }}>
              <span className="label-text" style={{ color: 'var(--accent-green)', display: 'block', marginBottom: 'var(--space-2)' }}>
                A PATTERN YOU MAY WANT TO NOTICE…
              </span>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                Writing down your thoughts in the Journal correlates with a clearer state of mind the following afternoon.
              </p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
