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
