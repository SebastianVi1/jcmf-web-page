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
  const seed = Number(name.split('_')[1]) * 0.73;
  const swing = Math.sin(seconds * 2.4 + seed),
    detail = Math.sin(seconds * 4.8 + seed);
  let shoulder = -0.85,
    elbow = -0.55;
  if (['shovel', 'garden', 'cleanup'].includes(activity)) {
    shoulder = -0.65 + 0.32 * swing;
    elbow = -0.48 + 0.22 * swing;
  } else if (
    ['window', 'railing', 'roof', 'drill', 'rebar'].includes(activity)
  ) {
    shoulder = -1.15 + 0.035 * detail;
    elbow = -0.65 + 0.06 * detail;
  } else if (['hammer', 'saw', 'masonry'].includes(activity)) {
    shoulder = -0.95 + (side === 1 ? 0.38 * swing : 0.025 * detail);
    elbow = -0.65 + (side === 1 ? 0.32 * swing : 0);
  } else if (activity === 'paint') {
    shoulder = -1.15 + 0.42 * swing;
    elbow = -0.4 + 0.12 * swing;
  } else if (['supervise', 'operate'].includes(activity)) {
    shoulder = -0.6 + 0.04 * swing;
    elbow = -0.9 + 0.05 * swing;
  } else if (activity === 'carry') {
    shoulder = -1.22 + 0.035 * swing;
    elbow = -0.3;
  }
  let neutral = 0,
    target = 0;
  if (name.includes('Shoulder')) {
    neutral = 0.06 * side;
    target = activity === 'walk' ? -0.3 * Math.sin(phase) * side : shoulder;
  } else if (name.includes('Elbow')) {
    neutral = -0.12;
    target = activity === 'walk' ? -0.24 : elbow;
  } else if (name.includes('Hip')) {
    target =
      activity === 'walk'
        ? 0.34 * Math.sin(phase) * side
        : ['shovel', 'garden'].includes(activity)
          ? 0.07 * swing
          : 0;
  } else {
    target =
      activity === 'walk'
        ? 0.28 * Math.max(0, -Math.sin(phase) * side)
        : ['shovel', 'garden'].includes(activity)
          ? 0.09 * (swing + 1)
          : 0;
  }
  if (activity === 'idle') target = neutral;
  return neutral + (target - neutral) * w * (active ? 1 : 0);
}

/** Presentation smoothing only. Geometry and worker routes remain stateless/reversible. */
export function createProgressSmoother(initial = 0) {
  let value = Number.isFinite(initial) ? Math.max(0, Math.min(1, initial)) : 0;
  let velocity = 0;
  return {
    step(target: number, dt: number, reducedMotion = false) {
      target = Number.isFinite(target) ? Math.max(0, Math.min(1, target)) : 0;
      if (reducedMotion) {
        value = target;
        velocity = 0;
        return value;
      }
      dt = Number.isFinite(dt) ? Math.max(0, Math.min(1, dt)) : 0;
      // Exact critically damped spring: stable at both low and high frame rates.
      const omega = 14,
        offset = value - target,
        c = velocity + omega * offset,
        decay = Math.exp(-omega * dt);
      value = target + (offset + c * dt) * decay;
      velocity = (velocity - omega * c * dt) * decay;
      value = Math.max(0, Math.min(1, value));
      if (Math.abs(target - value) < 0.00001 && Math.abs(velocity) < 0.0001) {
        value = target;
        velocity = 0;
      }
      return value;
    },
    get value() {
      return value;
    },
  };
}
