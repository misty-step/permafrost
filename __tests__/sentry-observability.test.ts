import { beforeEach, describe, expect, it, vi } from 'vitest';

const { initMock, captureRequestErrorMock } = vi.hoisted(() => ({
  initMock: vi.fn(),
  captureRequestErrorMock: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  init: initMock,
  captureRequestError: captureRequestErrorMock,
}));

const resetSentryEnv = () => {
  delete process.env.SENTRY_DSN;
  delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  delete process.env.NEXT_RUNTIME;
  delete process.env.NODE_ENV;
};

describe('sentry configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetSentryEnv();
  });

  it('prefers SENTRY_DSN for edge runtime config', async () => {
    process.env.SENTRY_DSN = 'server-edge-dsn';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'public-dsn';

    await import('../sentry.edge.config');

    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'server-edge-dsn',
        enabled: true,
      }),
    );
  });

  it('uses production traces sample rate when NODE_ENV is production', async () => {
    process.env.SENTRY_DSN = 'dsn';
    process.env.NODE_ENV = 'production';

    await import('../sentry.server.config');

    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tracesSampleRate: 0.1,
      }),
    );
  });
});

describe('instrumentation register', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetSentryEnv();
  });

  it('loads server sentry config for node runtime', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.SENTRY_DSN = 'server-dsn';

    const { register } = await import('../instrumentation');
    await register();

    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'server-dsn',
      }),
    );
  });

  it('loads edge sentry config for edge runtime', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    process.env.SENTRY_DSN = 'edge-dsn';

    const { register } = await import('../instrumentation');
    await register();

    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'edge-dsn',
      }),
    );
  });

  it('does not load sentry config for unsupported runtime', async () => {
    process.env.NEXT_RUNTIME = 'browser';

    const { register } = await import('../instrumentation');
    await register();

    expect(initMock).not.toHaveBeenCalled();
  });

  it('re-exports captureRequestError as onRequestError', async () => {
    const instrumentationModule = await import('../instrumentation');
    expect(instrumentationModule.onRequestError).toBe(captureRequestErrorMock);
  });
});
