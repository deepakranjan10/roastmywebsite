'use client';

import clsx from 'clsx';
import { PERSONALITY_LABELS, type Personality } from '@/types/audit';

const PERSONALITY_EMOJI: Record<Personality, string> = {
  brutal: '🥊',
  savage: '😈',
  corporate: '💼',
  friendly: '🙂',
  indian_uncle: '👨🏽',
  developer: '💻',
  seo_expert: '📈',
  gen_z: '✨',
};

const ORDER: Personality[] = ['savage', 'brutal', 'friendly', 'gen_z', 'developer', 'seo_expert', 'corporate', 'indian_uncle'];

export function PersonalityPicker({
  value,
  onChange,
}: {
  value: Personality;
  onChange: (p: Personality) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORDER.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={clsx(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
            value === p
              ? 'border-flame-500 bg-flame-500/15 text-flame-400'
              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
          )}
        >
          <span>{PERSONALITY_EMOJI[p]}</span>
          {PERSONALITY_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
