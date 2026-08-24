'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PersonalityPicker } from '@/components/personality-picker';
import { LoadingSequence } from '@/components/loading-sequence';
import type { Personality } from '@/types/audit';

export function RoastForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [personality, setPersonality] = useState<Personality>('savage');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    let candidate = url.trim();
    if (!candidate) {
      setError('Enter a URL first. We can\'t roast a blank page.');
      return;
    }
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = `https://${candidate}`;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: candidate, personality, isPublic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try another URL.');
        setLoading(false);
        return;
      }
      router.push(`/roast/${data.domain}/${data.id}`);
    } catch {
      setError('Network error. Try again in a moment.');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div id="roast-form" className="card-surface rounded-2xl p-6 sm:p-8">
        <LoadingSequence />
      </div>
    );
  }

  return (
    <form id="roast-form" onSubmit={handleSubmit} className="card-surface rounded-2xl p-5 shadow-2xl shadow-black/40 sm:p-7 scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="https://yourwebsite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-ink-950/70 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none ring-flame-500/50 transition focus:ring-2"
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-xl bg-flame-gradient px-6 py-4 font-display font-bold text-white shadow-lg shadow-flame-600/30 transition hover:brightness-110 active:scale-[0.98]"
        >
          ROAST MY WEBSITE 🔥
        </button>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-flame-400">{error}</p>}

      <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Pick a roast personality</div>
          <PersonalityPicker value={personality} onChange={setPersonality} />
        </div>
      </div>

      <label className="mt-5 flex items-center gap-2 text-xs text-white/50">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-ink-950 accent-flame-500"
        />
        Add my roast to the public leaderboard (off by default — your URL stays private unless you check this)
      </label>

      <p className="mt-3 text-center text-xs text-white/30 sm:text-left">No signup. No sales call. Just pain.</p>
    </form>
  );
}
