'use client';

import type { ReactNode } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

let postHogInitialized = false;

function initializePostHog() {
  if (postHogInitialized) return;
  if (typeof window === 'undefined') return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return;

  posthog.init(apiKey, {
    api_host: 'https://us.i.posthog.com',
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
    },
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug();
    },
  });

  postHogInitialized = true;
}

initializePostHog();
// Init at module load so first pageview events are not emitted before client setup.

export function PostHogProvider({ children }: { children: ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
