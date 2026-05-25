import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/wordmark-white.svg"
            alt="Nivoda"
            style={{ height: 18, width: 'auto' }}
          />
          <span style={{ opacity: 0.5, fontSize: '0.875rem' }}>
            / Clarity by Nivoda
          </span>
        </span>
      ),
    },
  };
}
