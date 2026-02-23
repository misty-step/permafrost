import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { captureMock, usePathnameMock, useSearchParamsMock } = vi.hoisted(() => ({
  captureMock: vi.fn(),
  usePathnameMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
}));

vi.mock('posthog-js', () => ({
  default: {
    capture: captureMock,
  },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

import { PostHogPageview } from '../PostHogPageview';

describe('PostHogPageview', () => {
  beforeEach(() => {
    captureMock.mockReset();
    usePathnameMock.mockReset();
    useSearchParamsMock.mockReset();
  });

  it('captures pageview with pathname and query string', async () => {
    usePathnameMock.mockReturnValue('/weather');
    useSearchParamsMock.mockReturnValue({
      toString: () => 'year=1957',
    });

    render(<PostHogPageview />);

    await waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });
    const origin = window.origin;
    expect(captureMock).toHaveBeenCalledWith('$pageview', {
      $current_url: `${origin}/weather?year=1957`,
    });
  });

  it('does not recapture when query object identity changes but query string is the same', async () => {
    usePathnameMock.mockReturnValue('/weather');
    useSearchParamsMock.mockReturnValue({
      toString: () => 'year=1957',
    });

    const { rerender } = render(<PostHogPageview />);

    await waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });

    useSearchParamsMock.mockReturnValue({
      toString: () => 'year=1957',
    });
    rerender(<PostHogPageview />);

    await waitFor(() => {
      expect(captureMock).toHaveBeenCalledTimes(1);
    });
  });
});
