import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Empty on the subdomain (roofy.eclipse-business.com). Only set it to preview under a path.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
// `page.dev.tsx` pages (the video factory's render page) exist only in `next dev`: never in the export.
const isDev = process.env.NODE_ENV === 'development';

const config: NextConfig = withNextIntl({
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  pageExtensions: isDev ? ['dev.tsx', 'tsx', 'ts'] : ['tsx', 'ts'],
  reactStrictMode: true,
  // Lets several dev servers run side by side (one per distDir).
  distDir: process.env.NEXT_DIST_DIR || '.next',
});

export default config;
