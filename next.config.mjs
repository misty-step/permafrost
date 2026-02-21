import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/permafrost',
  images: {
    unoptimized: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: 'misty-step',
  project: 'permafrost',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
