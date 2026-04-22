// Idle detection primitives used by the scroll-cue nudge on the hero.
//
// `createIdleDetector` holds no DOM knowledge — it just manages a timer and
// a single `fire on idle / fire on activity` pair. That makes it unit-
// testable with fake timers. The React hook below layers the browser glue
// (event listeners, class toggling) on top.

/**
 * Creates an idle detector.
 *
 * @param {object} opts
 * @param {number} [opts.delay=3000]   ms of inactivity before onIdle fires.
 * @param {() => void} [opts.onIdle]   Called once when the idle threshold is reached.
 * @param {() => void} [opts.onActive] Called when activity is observed AFTER onIdle fired.
 *   (Activity before the threshold simply resets the timer — onActive is not invoked.)
 * @param {(cb:()=>void,ms:number) => any} [opts.setTimer=setTimeout]
 * @param {(id:any) => void}                [opts.clearTimer=clearTimeout]
 *   Injectable timer functions (same shape as setTimeout/clearTimeout) so
 *   tests can run without real clocks.
 * @returns {{start: () => void, stop: () => void, poke: () => void}}
 *   - `start`: begin the idle countdown.
 *   - `stop`: cancel and release resources. Idempotent.
 *   - `poke`: record activity. Before idle: resets the timer. After idle:
 *     invokes onActive, then stops (one-shot).
 */
export function createIdleDetector({
  delay = 3000,
  onIdle = () => {},
  onActive = () => {},
  setTimer = setTimeout,
  clearTimer = clearTimeout,
} = {}) {
  let timer = null;
  let fired = false;
  let running = false;

  const arm = () => {
    if (timer !== null) clearTimer(timer);
    timer = setTimer(() => {
      fired = true;
      timer = null;
      onIdle();
    }, delay);
  };

  return {
    start() {
      if (running) return;
      running = true;
      fired = false;
      arm();
    },
    stop() {
      if (timer !== null) { clearTimer(timer); timer = null; }
      running = false;
      fired = false;
    },
    poke() {
      if (!running) return;
      if (fired) {
        // Activity after idle: fire onActive once, then stop.
        onActive();
        this.stop();
      } else {
        arm();
      }
    },
  };
}
