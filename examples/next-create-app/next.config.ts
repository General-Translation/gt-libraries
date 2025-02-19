import { withGTConfig } from 'gt-next/config';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default withGTConfig(nextConfig, {
  defaultLocale: 'en-US',
  locales: ['en-US', 'fr', 'es', 'zh'],
});
