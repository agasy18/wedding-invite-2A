import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createIdleDetector } from './idleNudge.js';

describe('createIdleDetector', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('fires onIdle after the configured delay', () => {
    const onIdle = vi.fn();
    const d = createIdleDetector({ delay: 1000, onIdle });
    d.start();
    expect(onIdle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(999);
    expect(onIdle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('does not fire onIdle if stop() happens before the delay', () => {
    const onIdle = vi.fn();
    const d = createIdleDetector({ delay: 1000, onIdle });
    d.start();
    vi.advanceTimersByTime(500);
    d.stop();
    vi.advanceTimersByTime(10_000);
    expect(onIdle).not.toHaveBeenCalled();
  });

  it('poke() before idle resets the timer — not just delays it by the remainder', () => {
    const onIdle = vi.fn();
    const d = createIdleDetector({ delay: 1000, onIdle });
    d.start();
    vi.advanceTimersByTime(900);
    d.poke();                    // resets the 1000ms clock
    vi.advanceTimersByTime(999); // would have already fired without reset
    expect(onIdle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('onActive fires only after idle, and once', () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();
    const d = createIdleDetector({ delay: 1000, onIdle, onActive });
    d.start();
    d.poke();  // before idle — no onActive
    expect(onActive).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(onIdle).toHaveBeenCalled();
    d.poke();  // now idle — onActive fires
    expect(onActive).toHaveBeenCalledTimes(1);
    d.poke();  // detector has stopped itself; no more calls
    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it('start() twice is a no-op (idempotent)', () => {
    const onIdle = vi.fn();
    const d = createIdleDetector({ delay: 1000, onIdle });
    d.start();
    vi.advanceTimersByTime(500);
    d.start();                     // must not re-arm from zero
    vi.advanceTimersByTime(500);
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('stop() is idempotent — calling twice does nothing bad', () => {
    const d = createIdleDetector({ delay: 1000 });
    d.start();
    d.stop();
    expect(() => d.stop()).not.toThrow();
  });

  it('poke() while not running is ignored', () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();
    const d = createIdleDetector({ delay: 1000, onIdle, onActive });
    // Never called start.
    d.poke();
    vi.advanceTimersByTime(2000);
    expect(onIdle).not.toHaveBeenCalled();
    expect(onActive).not.toHaveBeenCalled();
  });

  it('supports injected timer functions (no real clock needed)', () => {
    const calls = [];
    const fakeSet = (cb, ms) => { calls.push({ ms, cb }); return 42; };
    const fakeClear = vi.fn();
    const onIdle = vi.fn();
    const d = createIdleDetector({
      delay: 500,
      onIdle,
      setTimer: fakeSet,
      clearTimer: fakeClear,
    });
    d.start();
    expect(calls).toHaveLength(1);
    expect(calls[0].ms).toBe(500);
    calls[0].cb();                 // simulate timer firing
    expect(onIdle).toHaveBeenCalled();
    d.stop();                      // timer already fired, should NOT clear.
    expect(fakeClear).not.toHaveBeenCalled();
  });

  it('clears the pending timer when stop() is called before firing', () => {
    const fakeClear = vi.fn();
    const d = createIdleDetector({
      delay: 500,
      setTimer: () => 7,
      clearTimer: fakeClear,
    });
    d.start();
    d.stop();
    expect(fakeClear).toHaveBeenCalledWith(7);
  });
});
