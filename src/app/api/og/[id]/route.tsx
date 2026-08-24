import { ImageResponse } from 'next/og';
import { getAuditById } from '@/lib/store';

export const runtime = 'nodejs';

const WIDTH = 1200;
const HEIGHT = 630;

function scoreColor(score: number): string {
  if (score < 30) return '#ff2d55';
  if (score < 50) return '#ff5c33';
  if (score < 70) return '#ff9d5c';
  if (score < 85) return '#c2ff00';
  return '#7cff8f';
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const audit = await getAuditById(params.id);

  if (!audit) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0f',
            color: 'white',
            fontSize: 48,
          }}
        >
          RoastMyWebsite.lol
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  }

  const topLine = audit.roast.lines[0]?.text ?? audit.roast.headline;
  const color = scoreColor(audit.overallScore);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #16161f 60%, #1e1e2a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', fontSize: 34 }}>🔥</div>
          <div style={{ display: 'flex', fontSize: 28, color: '#ff5c33', fontWeight: 700, letterSpacing: -0.5 }}>
            ROASTMYWEBSITE.LOL
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 26, color: '#9a9aab', display: 'flex' }}>{audit.domain}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div style={{ display: 'flex', fontSize: 140, fontWeight: 800, color, lineHeight: 1 }}>{audit.overallScore}</div>
            <div style={{ display: 'flex', fontSize: 40, color: '#5a5a6a' }}>/100</div>
          </div>
          <div
            style={{
              fontSize: 34,
              color: 'white',
              fontWeight: 600,
              lineHeight: 1.3,
              maxWidth: 980,
              display: 'flex',
            }}
          >
            “{topLine.length > 140 ? topLine.slice(0, 137) + '...' : topLine}”
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 22, color: '#5a5a6a' }}>roastmywebsite.lol</div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
