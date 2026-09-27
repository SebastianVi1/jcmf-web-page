export type RouteSegment = {
  start: number;
  end: number;
  path: number[][];
  lengths: number[];
  length: number;
  activity: string;
  heading: number;
  distance: number;
};
export type WorkerState = {
  position: number[];
  heading: number;
  activity: string;
  weight: number;
  phase: number;
  visibility: number;
  segment: number;
};
export const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
function upper(values: number[], value: number) {
  let a = 0,
    b = values.length;
  while (a < b) {
    const c = (a + b) >>> 1;
    if (values[c] <= value) a = c + 1;
    else b = c;
  }
  return a;
}
const angleMix = (a: number, b: number, t: number) =>
  a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

export function sampleWorkerRoute(
  plan: RouteSegment[],
  p: number,
): WorkerState | undefined {
  if (!plan.length) return;
  const index = Math.max(
    0,
    Math.min(
      plan.length - 1,
      upper(
        plan.map((s) => s.start),
        p,
      ) - 1,
    ),
  );
  const s = plan[index];
  const u = Math.max(0, Math.min(1, (p - s.start) / (s.end - s.start)));
  let position = s.path[0],
    heading = s.heading,
    weight = ease(Math.min(u, 1 - u) / 0.2),
    phase = p * 48 * 3.5;
  if (s.length > 1e-8) {
    const distance = ease(u) * s.length;
    const at = (value: number) => {
      const d = Math.max(0, Math.min(s.length, value));
      const i = Math.max(
        0,
        Math.min(s.path.length - 2, upper(s.lengths, d) - 1),
      );
      const t = (d - s.lengths[i]) / (s.lengths[i + 1] - s.lengths[i]);
      return s.path[i].map((v, k) => v + (s.path[i + 1][k] - v) * t);
    };
    position = at(distance);
    const a = at(distance - 0.25),
      b = at(distance + 0.25);
    heading = Math.atan2(b[0] - a[0], -(b[1] - a[1]));
    const h0 = index ? plan[index - 1].heading : heading;
    const h1 = index + 1 < plan.length ? plan[index + 1].heading : heading;
    if (u < 0.1) heading = angleMix(h0, heading, ease(u / 0.1));
    if (u > 0.9) heading = angleMix(heading, h1, ease((u - 0.9) / 0.1));
    weight = ease(Math.min(u, 1 - u) / 0.15);
    phase = (s.distance + distance) * 5.5;
  }
  const visibility =
    ease((p - plan[0].start) / 0.006) *
    (1 - ease((p - plan[plan.length - 1].end) / 0.006));
  return {
    position,
    heading,
    weight,
    phase,
    visibility,
    activity: s.activity,
    segment: index,
  };
}

export function workerPose(
  name: string,
  state: WorkerState | undefined,
  seconds: number,
  active: boolean,
) {
  const activity = state?.activity ?? 'idle',
    w = state?.weight ?? 0,
    phase = state?.phase ?? 0;
  const side = name.endsWith('_L') ? -1 : 1;
  let neutral = 0,
    target = 0;
  if (name.includes('Shoulder')) {
    neutral = 0.06 * side;
    target =
      activity === 'walk'
        ? -0.3 * Math.sin(phase) * side
        : -1.1 + 0.16 * Math.sin(seconds * 3.5 + side);
  } else if (name.includes('Elbow')) {
    neutral = -0.12;
    target =
      activity === 'walk'
        ? -0.24
        : -0.55 + 0.16 * Math.sin(seconds * 3.5 + side);
  } else if (name.includes('Hip')) {
    target = activity === 'walk' ? 0.34 * Math.sin(phase) * side : 0;
  } else
    target =
      activity === 'walk' ? 0.28 * Math.max(0, -Math.sin(phase) * side) : 0;
  if (activity === 'idle') target = neutral;
  return neutral + (target - neutral) * w * (active ? 1 : 0);
}

/** Presentation smoothing only. Geometry and worker routes remain stateless/reversible. */
export function createProgressSmoother(initial = 0) {
  let value = Math.max(0, Math.min(1, initial));
  return {
    step(target: number, dt: number, reducedMotion = false) {
      target = Number.isFinite(target) ? Math.max(0, Math.min(1, target)) : 0;
      if (reducedMotion) {
        value = target;
        return value;
      }
      dt = Math.max(0, Math.min(0.1, dt));
      const delta = (target - value) * (1 - Math.exp(-9 * dt));
      value += Math.max(-0.35 * dt, Math.min(0.35 * dt, delta));
      if (Math.abs(target - value) < 1e-7) value = target;
      return value;
    },
    get value() {
      return value;
    },
  };
}
