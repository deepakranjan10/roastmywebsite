import type { Personality } from '@/types/audit';

/**
 * Deterministic string hash + seeded picker. Roasts must be reproducible
 * for a given (site, personality) pair so that caching an audit doesn't
 * change its roast on a cache hit, so we avoid Math.random entirely.
 */
export function seededPick<T>(items: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length] as T;
}

export interface PersonalityVoice {
  label: string;
  tagline: string;
  headlines: { min: number; text: string }[];
  openers: string[];
  closers: { min: number; text: string }[];
  /** Wraps a neutral, factual joke sentence in this personality's voice. */
  stylize: (raw: string, seed: string) => string;
}

const CORPORATE_JARGON = [
  'Per our analysis, ', 'Circling back on this: ', 'To align on priorities: ', 'Flagging this for visibility: ',
];
const CORPORATE_CLOSE = [
  ' Let’s take this offline.', ' Actioning this would move the needle.', ' Adding to the roadmap.',
];

const DEV_PREFIX = [
  'console.warn: ', '// TODO but it has been 3 years: ', 'git blame says this was "temporary": ',
];

const UNCLE_OPENERS = ['Beta, ', 'Arre beta, ', 'Suno, '];
const UNCLE_TAGS = [' Ekdum first-class nahi hai.', ' Thoda dhyan do.', ' Log kya kahenge?', ' Sudhaar lo, no tension.'];

const GENZ_TAGS = [' no cap.', ' it’s giving unfinished.', ' the algorithm is NOT here for this.', ' bestie, fix it.', ' lowkey rough.'];

const SAVAGE_TAGS = [' Iconic, in the worst way.', ' A choice was made. The wrong one.', ' Bold strategy.', ' Truly a decision.'];

const BRUTAL_TAGS = [' Fix it.', ' Unacceptable.', ' No excuse for this.'];

const FRIENDLY_TAGS = [' Totally fixable though!', ' Easy win here.', ' Nothing a quick fix can’t solve.', ' You’ve got this.'];

const SEO_TAGS = [' Crawlers are taking notes, and not the good kind.', ' This is a ranking factor, not a suggestion.', ' Algorithmically speaking, this hurts.'];

export const PERSONALITIES: Record<Personality, PersonalityVoice> = {
  brutal: {
    label: 'Brutal',
    tagline: 'No cushioning. Just the truth.',
    headlines: [
      { min: 0, text: 'This website is a crime scene.' },
      { min: 30, text: 'This website is barely holding on.' },
      { min: 50, text: 'This website is mediocre and knows it.' },
      { min: 70, text: 'This website is fine. Fine is forgettable.' },
      { min: 85, text: 'Fine. It’s actually good.' },
    ],
    openers: ['Let’s be honest.', 'Straight up:', 'No sugarcoating this.', 'Here’s the truth.'],
    closers: [
      { min: 0, text: 'This isn’t a website, it’s a cry for help.' },
      { min: 50, text: 'It works. That’s the nicest thing I can say.' },
      { min: 85, text: 'Genuinely well built. Don’t let it go to your head.' },
    ],
    stylize: (raw, seed) => `${raw}${seededPick(BRUTAL_TAGS, seed)}`,
  },
  savage: {
    label: 'Savage',
    tagline: 'Clever, cutting, and a little too accurate.',
    headlines: [
      { min: 0, text: 'This website said "let them eat bugs."' },
      { min: 30, text: 'This website is surviving on vibes alone.' },
      { min: 50, text: 'This website is giving "we’ll fix it later."' },
      { min: 70, text: 'This website almost has its life together.' },
      { min: 85, text: 'Okay, this website actually ate.' },
    ],
    openers: ['Buckle up.', 'Oh, we’re doing this?', 'So, funny story.', 'Deep breath.'],
    closers: [
      { min: 0, text: 'Someone shipped this and then went to lunch. Forever.' },
      { min: 50, text: 'It’s not a disaster. It’s just... a lot.' },
      { min: 85, text: 'Rude, honestly, how good this is.' },
    ],
    stylize: (raw, seed) => `${raw}${seededPick(SAVAGE_TAGS, seed)}`,
  },
  corporate: {
    label: 'Corporate',
    tagline: 'Devastating feedback, delivered in a status meeting.',
    headlines: [
      { min: 0, text: 'Per our findings, this is a P0 incident.' },
      { min: 30, text: 'This asset is underperforming against benchmarks.' },
      { min: 50, text: 'There are opportunities for optimization here.' },
      { min: 70, text: 'Solid foundation, some action items remain.' },
      { min: 85, text: 'Best-in-class execution, per this quarter’s review.' },
    ],
    openers: ['Per our analysis,', 'Looping in the findings:', 'For alignment purposes:', 'Noting for the record:'],
    closers: [
      { min: 0, text: 'Recommend an all-hands to discuss root cause.' },
      { min: 50, text: 'Adding these to next sprint’s backlog.' },
      { min: 85, text: 'Great work, team. Let’s sustain this momentum.' },
    ],
    stylize: (raw, seed) => `${seededPick(CORPORATE_JARGON, seed)}${lower(raw)}${seededPick(CORPORATE_CLOSE, seed)}`,
  },
  friendly: {
    label: 'Friendly',
    tagline: 'Honest feedback from a friend who wants you to win.',
    headlines: [
      { min: 0, text: 'Okay, we have some work to do together!' },
      { min: 30, text: 'There’s real potential here, promise.' },
      { min: 50, text: 'You’re halfway to something good.' },
      { min: 70, text: 'This is genuinely solid work!' },
      { min: 85, text: 'Wow, this is really impressive!' },
    ],
    openers: ['So, quick heads up:', 'Gentle nudge:', 'Just so you know:', 'Friendly flag:'],
    closers: [
      { min: 0, text: 'None of this is unfixable — let’s take it one step at a time.' },
      { min: 50, text: 'You’re closer than you think!' },
      { min: 85, text: 'Seriously, nice work. Keep it up.' },
    ],
    stylize: (raw, seed) => `${raw}${seededPick(FRIENDLY_TAGS, seed)}`,
  },
  indian_uncle: {
    label: 'Indian Uncle',
    tagline: 'Beta, sit down. We need to talk about your website.',
    headlines: [
      { min: 0, text: 'Beta, yeh website dekh ke tension ho gaya.' },
      { min: 30, text: 'Beta, potential hai, par abhi kaam baaki hai.' },
      { min: 50, text: 'Theek-thaak hai, par "theek-thaak" se kaam nahi chalega.' },
      { min: 70, text: 'Accha kaam kiya hai, shaabash.' },
      { min: 85, text: 'Wah beta, ekdum first-class!' },
    ],
    openers: ['Beta,', 'Suno beta,', 'Arre,', 'Dekho beta,'],
    closers: [
      { min: 0, text: 'Beta, thoda sudhaar karo, sab theek ho jayega.' },
      { min: 50, text: 'Chalta hai, par aur accha ho sakta hai.' },
      { min: 85, text: 'Bahut accha beta, proud hoon.' },
    ],
    stylize: (raw, seed) => `${seededPick(UNCLE_OPENERS, seed)}${lower(raw)}${seededPick(UNCLE_TAGS, seed)}`,
  },
  developer: {
    label: 'Developer',
    tagline: 'Roasted the way we roast pull requests.',
    headlines: [
      { min: 0, text: 'This build failed CI and shipped anyway.' },
      { min: 30, text: 'Technical debt has compound interest now.' },
      { min: 50, text: 'It compiles. That’s the bar we cleared.' },
      { min: 70, text: 'Clean-ish. A few TODOs left in prod.' },
      { min: 85, text: 'Actually well-engineered. Nice.' },
    ],
    openers: ['// note:', 'Code review comment:', 'Debug log:', 'Stack trace says:'],
    closers: [
      { min: 0, text: 'Recommend a full refactor, not a hotfix.' },
      { min: 50, text: 'File these as tickets and knock them out.' },
      { min: 85, text: 'Ship it. This one’s solid.' },
    ],
    stylize: (raw, seed) => `${seededPick(DEV_PREFIX, seed)}${lower(raw)}`,
  },
  seo_expert: {
    label: 'SEO Expert',
    tagline: 'Roasted in pure algorithm-speak.',
    headlines: [
      { min: 0, text: 'Google doesn’t know this page exists, and honestly, fair.' },
      { min: 30, text: 'This page is fighting its own crawlability.' },
      { min: 50, text: 'Indexable, but not exactly competitive.' },
      { min: 70, text: 'Solid on-page fundamentals.' },
      { min: 85, text: 'This is what a ranking factor looks like.' },
    ],
    openers: ['From a crawlability standpoint,', 'SERP-wise,', 'Algorithmically,', 'From an indexation angle,'],
    closers: [
      { min: 0, text: 'This needs a technical SEO pass before content even matters.' },
      { min: 50, text: 'Fix the fundamentals and rankings will follow.' },
      { min: 85, text: 'This is textbook technical SEO. Respect.' },
    ],
    stylize: (raw, seed) => `${raw}${seededPick(SEO_TAGS, seed)}`,
  },
  gen_z: {
    label: 'Gen Z',
    tagline: 'Unfiltered, extremely online, weirdly accurate.',
    headlines: [
      { min: 0, text: 'this website is not the vibe rn' },
      { min: 30, text: 'this website said "good enough" and lied' },
      { min: 50, text: 'mid. certified mid.' },
      { min: 70, text: 'ok this actually kind of slaps' },
      { min: 85, text: 'no because this website ATE' },
    ],
    openers: ['ok so', 'not to be dramatic but', 'real talk,', 'ngl,'],
    closers: [
      { min: 0, text: 'this needs a full glow up, not a filter.' },
      { min: 50, text: 'it’s giving "almost". almost isn’t it though.' },
      { min: 85, text: 'no notes. this is the moment.' },
    ],
    stylize: (raw, seed) => `${lower(raw)}${seededPick(GENZ_TAGS, seed)}`,
  },
};

function lower(s: string): string {
  return s.length ? s[0]!.toLowerCase() + s.slice(1) : s;
}
