import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { initMock } = vi.hoisted(() => ({
  initMock: vi.fn(),
}));

vi.mock('posthog-js', () => ({
  default: {
    init: initMock,
  },
}));

vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('PostHogProvider', () => {
  beforeEach(() => {
    initMock.mockReset();
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  });

  it('initializes PostHog once when a key is configured', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test_key';
    const { PostHogProvider } = await import('../PostHogProvider');

    render(
      <PostHogProvider>
        <span>child</span>
      </PostHogProvider>,
    );

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(
      'phc_test_key',
      expect.objectContaining({
        api_host: 'https://us.i.posthog.com',
        capture_pageview: false,
        respect_dnt: true,
      }),
    );
    expect(screen.getByText('child')).toBeTruthy();
  });

  it('does not initialize PostHog when key is missing', async () => {
    const { PostHogProvider } = await import('../PostHogProvider');

    render(
      <PostHogProvider>
        <span>child</span>
      </PostHogProvider>,
    );

    expect(initMock).not.toHaveBeenCalled();
  });
});
