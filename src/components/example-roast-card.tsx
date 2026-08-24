import { ScoreRing, MiniScoreBar } from '@/components/score-ring';

export function ExampleRoastCard() {
  return (
    <div className="card-surface animate-pop-in rounded-2xl p-6 shadow-2xl shadow-black/40 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Website roast score</span>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
          Example
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreRing score={37} size={128} strokeWidth={10} />

        <div className="flex-1">
          <blockquote className="font-display text-lg font-semibold leading-snug text-white sm:text-xl">
            “Your homepage has 11 CTAs.
            <br />
            Apparently your conversion strategy is:
            <br />
            <span className="text-flame-400">‘Click something. I don't care what.’</span>”
          </blockquote>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-2.5 border-t border-white/10 pt-6">
        <MiniScoreBar label="SEO" score={42} />
        <MiniScoreBar label="UX" score={31} />
        <MiniScoreBar label="Performance" score={28} />
        <MiniScoreBar label="Content" score={61} />
        <MiniScoreBar label="Technical" score={47} />
      </div>
    </div>
  );
}
