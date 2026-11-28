import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Smallest server for the self-hosted machine: only the traced files, no image optimiser.
  output: 'standalone',
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
