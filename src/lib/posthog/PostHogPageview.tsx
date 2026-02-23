'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import posthog from 'posthog-js';

function PostHogPageviewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Depend on query string value, not object identity, to avoid duplicate captures.
  const search = searchParams.toString();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (search) url += '?' + search;
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, search]);

  return null;
}

export function PostHogPageview() {
  return (
    <Suspense fallback={null}>
      <PostHogPageviewInner />
    </Suspense>
  );
}
