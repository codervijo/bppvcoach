// src/__tests__/guides.test.js
// Guide pages: every registry entry has a page, and unreviewed guides stay
// out of search (noindex via Guide.astro + excluded from the sitemap).

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { guides, unreviewedUrls } from '../lib/guides.mjs';

const SITE = 'https://bppvcoach.com';

describe('guides registry', () => {
  it.each(guides.map((g) => [g.path]))('%s has a page', (path) => {
    const file = join(process.cwd(), 'src', 'pages', path, 'index.astro');
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file, 'utf8')).toContain(`path="${path}"`);
  });

  it('paths use the trailing-slash form', () => {
    for (const g of guides) expect(g.path).toMatch(/^\/guides\/[a-z0-9-]+\/$/);
  });

  it('unreviewed guides are excluded from the sitemap', () => {
    const excluded = unreviewedUrls(SITE);
    for (const g of guides.filter((g) => !g.reviewed)) {
      expect(excluded).toContain(`${SITE}${g.path}`);
    }
  });

  it('reviewed guides carry no [VERIFY] markers', () => {
    for (const g of guides.filter((g) => g.reviewed)) {
      const src = readFileSync(join(process.cwd(), 'src', 'pages', g.path, 'index.astro'), 'utf8');
      expect(src).not.toMatch(/VERIFY/);
    }
  });
});
