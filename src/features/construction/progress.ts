export const phaseEnds = [0.15, 0.2, 0.4, 0.6, 0.75, 0.9, 1] as const;

export function modelProgress(scrollProgress: number) {
  return Number.isFinite(scrollProgress)
    ? Math.max(0, Math.min(1, scrollProgress / 0.9))
    : 0;
}

export function phaseIndex(progress: number) {
  const index = phaseEnds.findIndex((end) => progress < end);
  return index < 0 ? phaseEnds.length - 1 : index;
}

export function brandReveal(progress: number) {
  const amount = Math.max(0, Math.min(1, (progress - 0.78) / 0.2));
  return amount * amount * (3 - 2 * amount);
}

export function cameraPose(progress: number) {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const ease = p * p * (3 - 2 * p);
  return {
    azimuth: Math.atan2(-31, 39) - 0.22 + ease * 0.44,
    elevation: 0.64 - ease * 0.22,
  };
}

export const steerTuning = {
  yawRate: 0.7,
  tiltRate: 0.4,
  tiltMin: -0.3,
  tiltMax: 0.35,
  // A quick tap still moves the model a perceptible amount.
  minHold: 0.25,
  smoothing: 0.08,
};

export type SteerDirection = 'left' | 'right' | 'up' | 'down';

export function wrapPi(angle: number) {
  const turn = Math.PI * 2;
  return ((((angle + Math.PI) % turn) + turn) % turn) - Math.PI;
}

// Smooth window over the last stretch of the sequence: the idle drift fades
// out here so the animation ends exactly on the frontal facade.
export function settleAmount(progress: number) {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const amount = Math.max(0, Math.min(1, (p - 0.85) / 0.15));
  return amount * amount * (3 - 2 * amount);
}

// The scroll sequence turns the building from its right side toward the left;
// the last frame is the frontal facade seen from the camera. Total turn in rad.
export const sequenceTurn = 2;

export function sequenceSweep(progress: number) {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const ease = p * p * (3 - 2 * p);
  return sequenceTurn * (1 - ease);
}

// How much of the idle drift still shows at this progress (0 at the finale).
export function driftFade(progress: number) {
  return 1 - settleAmount(progress);
}

export function displayYaw(
  azimuth: number,
  progress: number,
  drift: number,
  offset: number,
) {
  return (
    azimuth + sequenceSweep(progress) + drift * driftFade(progress) + offset
  );
}

export function viewElevation(base: number, tilt: number) {
  return Math.max(0.05, Math.min(1.2, base + tilt));
}

interface SteerAxis {
  dir: number;
  held: boolean;
  holdTime: number;
  velocity: number;
  value: number;
}

// Fluid steering: while a control is held the offset moves at a constant rate
// with a soft start/stop; a tap commits to a short glide so it still moves.
export function createSteering() {
  const axes: Record<'yaw' | 'tilt', SteerAxis> = {
    yaw: { dir: 0, held: false, holdTime: 0, velocity: 0, value: 0 },
    tilt: { dir: 0, held: false, holdTime: 0, velocity: 0, value: 0 },
  };
  const axisOf = (direction: SteerDirection) =>
    direction === 'left' || direction === 'right' ? axes.yaw : axes.tilt;
  const signOf = (direction: SteerDirection) =>
    direction === 'right' || direction === 'up' ? 1 : -1;

  function advance(axis: SteerAxis, rate: number, dt: number, clamp: boolean) {
    axis.holdTime += dt;
    const engaged =
      axis.dir !== 0 && (axis.held || axis.holdTime < steerTuning.minHold);
    const target = engaged ? axis.dir * rate : 0;
    axis.velocity +=
      (target - axis.velocity) * (1 - Math.exp(-dt / steerTuning.smoothing));
    if (clamp) {
      axis.value = Math.max(
        steerTuning.tiltMin,
        Math.min(steerTuning.tiltMax, axis.value + axis.velocity * dt),
      );
    } else {
      axis.value += axis.velocity * dt;
    }
    return engaged || Math.abs(axis.velocity) > 1e-4;
  }

  return {
    press(direction: SteerDirection) {
      const axis = axisOf(direction);
      axis.dir = signOf(direction);
      axis.held = true;
      axis.holdTime = 0;
    },
    release(direction: SteerDirection) {
      const axis = axisOf(direction);
      if (axis.dir === signOf(direction)) axis.held = false;
    },
    releaseAll() {
      axes.yaw.held = false;
      axes.tilt.held = false;
    },
    step(dt: number) {
      const delta = Number.isFinite(dt) ? Math.max(0, Math.min(0.1, dt)) : 0;
      const yawActive = advance(axes.yaw, steerTuning.yawRate, delta, false);
      const tiltActive = advance(axes.tilt, steerTuning.tiltRate, delta, true);
      return {
        yaw: axes.yaw.value,
        tilt: axes.tilt.value,
        active: yawActive || tiltActive,
      };
    },
  };
}

export type Steering = ReturnType<typeof createSteering>;
