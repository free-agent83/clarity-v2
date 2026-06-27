import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Site-wide social share card (Open Graph + Twitter) for the home route and any
 * page that doesn't set its own image. Docs pages override this with their own
 * per-page card via `app/og/docs/[...slug]`.
 *
 * Fonts mirror the site: Nanum Myeongjo (serif) for the headline — same as the
 * hero — JetBrains Mono for the brand/label rows, and Inter for body. The .ttf
 * files are vendored in `_fonts` because Satori (the engine behind `next/og`)
 * needs real font data, not CSS. Nanum has no italic face (the hero fakes it via
 * the browser), so the accent line is slanted with a skew to match.
 */

export const alt = 'ClarityAI — an AI-first design system';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const VIOLET = '#9886ff'; // primitive violet-400 — legible accent on dark
const BG = '#09090b';

/** Read a vendored .ttf from `app/_fonts`, resolving against either cwd (app dir
 * in dev, possibly repo root under Nx build). Runs at build time — this route is
 * statically generated, so there's no runtime filesystem dependency. */
function loadFont(file: string) {
  const path = [
    join(process.cwd(), 'app/_fonts', file),
    join(process.cwd(), 'apps/docs/app/_fonts', file),
  ].find(existsSync);
  if (!path) throw new Error(`OG font not found: ${file}`);
  return readFileSync(path);
}

export default function Image() {
  const nanum400 = loadFont('NanumMyeongjo-400.ttf');
  const inter400 = loadFont('Inter-400.ttf');
  const mono400 = loadFont('JetBrainsMono-400.ttf');
  const mono700 = loadFont('JetBrainsMono-700.ttf');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: BG,
          backgroundImage: `radial-gradient(circle at 82% 12%, rgba(118,85,253,0.30) 0%, rgba(9,9,11,0) 52%)`,
          padding: '80px',
          color: '#ffffff',
          fontFamily: 'Inter',
        }}
      >
        {/* brand row — monospace */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontWeight: 700,
              fontSize: '26px',
              letterSpacing: '0.12em',
              color: VIOLET,
            }}
          >
            CLARITYAI
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontWeight: 400,
              fontSize: '26px',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.38)',
            }}
          >
            BY NIVODA
          </div>
        </div>

        {/* headline — serif, like the hero */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Nanum Myeongjo',
              fontSize: '94px',
              lineHeight: 1.06,
            }}
          >
            Clarity is an
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Nanum Myeongjo',
              fontSize: '94px',
              lineHeight: 1.06,
              color: VIOLET,
              transform: 'skewX(-10deg)',
              transformOrigin: 'left center',
            }}
          >
            AI-first design system
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Inter',
              fontWeight: 400,
              marginTop: '40px',
              fontSize: '33px',
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.62)',
              maxWidth: '920px',
            }}
          >
            Code-first and agent-readable. Tokens, components, and docs live in one
            repo — so whoever builds UI ships design-correct output by construction.
          </div>
        </div>

        {/* footer — monospace */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontWeight: 700,
              fontSize: '30px',
              color: VIOLET,
            }}
          >
            clarityai.design
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontWeight: 400,
              fontSize: '25px',
              letterSpacing: '0.02em',
              color: 'rgba(255,255,255,0.38)',
            }}
          >
            Tokens · Components · Patterns
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Nanum Myeongjo', data: nanum400, weight: 400, style: 'normal' },
        { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: mono400, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: mono700, weight: 700, style: 'normal' },
      ],
    },
  );
}
