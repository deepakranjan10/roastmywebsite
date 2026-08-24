import type { Finding, FindingId, SiteSignals } from '@/types/audit';

/**
 * One neutral, witty base joke per finding, grounded strictly in the
 * finding's own evidence (never invented). Personality "voice" wrapping
 * happens separately in engine.ts via PersonalityVoice.stylize — this file
 * is the shared comedic core every personality riffs on.
 */
type JokeFn = (finding: Finding, s: SiteSignals) => string;

const JOKES: Partial<Record<FindingId, JokeFn>> = {
  http_status_error: (f) => `Your homepage returns ${f.evidence.replace('Observed status code: ', 'a ')} — Google is knocking and nobody's answering the door.`,
  not_https: () => `Your website isn't using HTTPS. Browsers are basically putting up caution tape around it.`,
  redirect_chain: (f, s) => `Loading your homepage takes ${s.redirectCount} redirects. That's not a website, that's a scavenger hunt.`,
  missing_canonical: () => `There's no canonical tag, so Google is left guessing which version of your page is the "real" one — like a group chat that can't agree on plans.`,
  missing_robots_txt: () => `You don't have a robots.txt. Search engines are just wandering around your site with no instructions, like a substitute teacher.`,
  missing_sitemap: () => `No sitemap. You built a whole website and didn't leave Google a map to it.`,
  noindex: () => `Your homepage is set to noindex. You've asked Google to politely never mention you exist.`,
  missing_title: () => `Your homepage doesn't have a title. Google is basically meeting you for the first time and you're refusing to introduce yourself.`,
  title_too_long: (f) => `Your title tag is ${f.evidence.match(/\d+/)?.[0] ?? 'too many'} characters long. Google's going to cut you off mid-sentence like a bad phone call.`,
  title_too_short: () => `Your title tag is so short it barely counts as an introduction. "Hi." That's it? That's the pitch?`,
  missing_meta_description: () => `No meta description means Google writes your search snippet for you. Letting an algorithm improvise your first impression is a bold move.`,
  meta_description_too_long: () => `Your meta description is so long Google chops it off mid-thought, like someone hanging up before you finish the sentence`,
  meta_description_too_short: () => `Your meta description barely says anything. You had 160 characters and used, like, twelve.`,
  missing_h1: () => `There's no H1 on this page. It's a homepage with no headline, like a newspaper with a blank front page.`,
  multiple_h1: (f, s) => `You've got ${s.h1s.length} H1 tags. Pick a main character, please.`,
  heading_order_skipped: () => `Your heading structure skips levels like a toddler skipping stairs. Bold, but somebody's going to fall.`,
  broken_internal_links: (f) => `${f.evidence} Somewhere on this site, a link leads to absolutely nowhere, like a hallway in a dream.`,
  few_internal_links: () => `Barely any internal links. Your pages are basically strangers to each other.`,
  missing_structured_data: () => `No structured data. Google has to read your page the hard way, like assembling furniture without the instructions.`,
  missing_open_graph: () => `No Open Graph tags, so when someone shares your link in Slack it shows up looking like a ransom note. Just plain text and regret.`,
  missing_favicon: () => `No favicon. Your browser tab is just a blank rectangle, quietly judging you.`,
  missing_lang_attribute: () => `No lang attribute on the page. Technically your website doesn't officially speak any language.`,
  missing_viewport: () => `No responsive viewport tag, so on mobile your site renders like a desktop site viewed through a keyhole.`,
  messy_url_structure: () => `Your URLs are a mess of casing and symbols. It reads less like a web address and less like a CAPTCHA than you'd think, but not by much.`,
  large_page_weight: (f) => `${f.evidence} Your homepage weighs more than some entire apps.`,
  unoptimized_images: (f, s) => `${s.imagesTotal} images on one page. This isn't a homepage, it's a photo dump.`,
  render_blocking_resources: (f) => `${f.evidence} Your page politely waits for every script to finish before showing the visitor literally anything.`,
  heavy_javascript: (f, s) => `${s.scriptCount} script tags on the homepage. Somewhere in there is probably a library you use for one button.`,
  heavy_css: () => `Your CSS file is big enough to have its own subplot. Somewhere in there are three classes doing the same thing.`,
  no_caching_headers: () => `No caching headers, so every single visitor forces your server to do the whole job again from scratch. No memory. No mercy.`,
  slow_ttfb: (f) => `${f.evidence} Your website loads so slowly that users have enough time to reconsider their purchase.`,
  cwv_not_available: () => `Core Web Vitals couldn't be measured for this page. Even the diagnostic tools gave up.`,
  thin_content: (f, s) => `About ${s.wordCount} words on the whole homepage. That's not minimalism, that's just not finishing.`,
  generic_copy: () => `Your homepage is full of "best-in-class, cutting-edge, world-class" energy and zero actual information.`,
  unclear_value_prop: () => `You've written a bunch of words without actually explaining what you sell. That's impressive, in a specific way.`,
  low_readability: () => `This copy reads like it was written to satisfy a keyword density checklist, not a human.`,
  duplicate_headings_text: () => `Two of your headings say the exact same thing. Even your website is repeating itself out of boredom.`,
  missing_important_sections: () => `No About section, no contact info. Visitors have no idea who's actually behind this website.`,
  too_many_ctas: (f, s) => `Your homepage has ${s.ctaCount} buttons fighting for attention. Apparently your conversion strategy is "click something, I don't care what."`,
  no_clear_cta: () => `Your website appears to believe visitors will spontaneously know what to do next. They won't. Neither do I.`,
  nav_too_complex: (f, s) => `Your nav has ${s.navLinkCount} links in it. That's not a menu, that's a table of contents.`,
  no_trust_signals: () => `No testimonials, no reviews, no proof anyone has ever used this. Visitors are just supposed to trust you on vibes.`,
  no_contact_info: () => `There's no way to actually contact you. If someone wants to give you money, they'd have to work for it.`,
  form_without_labels: () => `Your form fields have no labels. Visitors are just guessing what each box wants, like a pop quiz nobody studied for.`,
  not_mobile_friendly: () => `This site isn't set up for mobile, which is where most of your visitors actually are. Bold to ignore the majority.`,
  images_missing_alt: (f, s) => `${s.imagesMissingAlt} of your images have no alt text. Congratulations, you've built a website for people who can see.`,
  inputs_missing_labels: () => `Your form fields are unlabeled for screen readers too. Some visitors literally cannot fill this out.`,
  empty_links_or_buttons: (f, s) => `${s.emptyLinksOrButtons} links or buttons on this page have no text at all. They just... exist. Doing nothing. Saying nothing.`,
  non_semantic_markup: () => `Clickable divs instead of real buttons. Keyboard users are just supposed to know that's a button by faith.`,
};

const FALLBACK_JOKE: JokeFn = (f) => f.problem;

export function jokeFor(finding: Finding, signals: SiteSignals): string {
  const fn = JOKES[finding.id] ?? FALLBACK_JOKE;
  return fn(finding, signals);
}
