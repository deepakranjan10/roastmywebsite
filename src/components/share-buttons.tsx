'use client';

import { useState } from 'react';

export function ShareButtons({ shareUrl, ogImageUrl, tweetText }: { shareUrl: string; ogImageUrl: string; tweetText: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — fail silently, link is still visible/selectable
    }
  }

  function downloadImage() {
    const a = document.createElement('a');
    a.href = ogImageUrl;
    a.download = 'roastmywebsite-result.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={tweetHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        𝕏 Share on X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        {copied ? '✅ Copied!' : '🔗 Copy Link'}
      </button>
      <button
        type="button"
        onClick={downloadImage}
        className="flex items-center gap-2 rounded-xl bg-flame-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-flame-600/20 transition hover:brightness-110"
      >
        ⬇️ Download Image
      </button>
    </div>
  );
}
