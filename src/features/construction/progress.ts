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
