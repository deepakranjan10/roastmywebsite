import { z } from 'zod';
import type { Roast } from '@/types/audit';

/**
 * Optional roast enhancement via the OpenAI API. The deterministic
 * template engine (engine.ts) is what actually guarantees findings are
 * never invented and the tone stays within bounds — this step only asks
 * a model to punch up the wording of lines we already generated. It is
 * never on the critical path: any failure, timeout, or malformed response
 * silently falls back to the deterministic roast.
 */

const EnhancedSchema = z.object({
  lines: z.array(z.string().min(1).max(280)).min(1).max(8),
});

const SYSTEM_PROMPT = `You punch up short website-audit roast lines for RoastMyWebsite.lol.
Rules, no exceptions:
- Roast the WEBSITE and its choices, never the person or company behind it.
- No discriminatory, hateful, sexual, or threatening content.
- Do not invent any new technical claims — only rephrase the given lines, keep every factual detail.
- Keep the same number of lines, same order, similar length.
- Return strict JSON: {"lines": ["...", ...]}`;

export async function maybeEnhanceRoast(roast: Roast, personalityLabel: string): Promise<Roast> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || roast.lines.length === 0) return roast;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: JSON.stringify({
              personality: personalityLabel,
              lines: roast.lines.map((l) => l.text),
            }),
          },
        ],
      }),
    });
    clearTimeout(timer);

    if (!res.ok) return roast;

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return roast;

    const parsed = EnhancedSchema.safeParse(JSON.parse(content));
    if (!parsed.success || parsed.data.lines.length !== roast.lines.length) return roast;

    return {
      ...roast,
      lines: roast.lines.map((line, i) => ({ ...line, text: parsed.data.lines[i] ?? line.text })),
    };
  } catch {
    return roast;
  }
}
