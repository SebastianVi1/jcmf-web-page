import { Object3D, Quaternion, Vector3 } from 'three';
import {
  sampleWorkerRoute,
  workerPose,
  type RouteSegment,
  type WorkerState,
} from './worker-routes.js';

export interface ConstructionOptions {
  animateWorkers?: boolean;
  animateMachinery?: boolean;
  showWorkers?: boolean;
  workerActivity?: Record<string, boolean>;
}
const smooth = (p: number, a: number, b: number) => {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const hoistLength = (p: number, time: number) => {
  const target = 1 + 15 * smooth(p, 0.19, 0.4);
  return Math.max(
    2.4,
    Math.min(19.2, 19.7 - target + 0.35 * Math.sin(time * 1.4)),
  );
};

// The source fades in the site itself; keep that base visible in a website hero.
const siteBase = new Set([
  'Terrain',
  'Excavation',
  'Excavation_Soil_To_Remove',
]);

/** Initialize once on a fresh clone of this delivery's GLB. Units: meters, Y-up. */
export function createConstructionController(root: Object3D) {
  const entries: {
    object: Object3D;
    position: Vector3;
    quaternion: Quaternion;
    scale: Vector3;
  }[] = [];
  const workers = new Map<string, RouteSegment[]>();
  root.traverse((object) => {
    const d = object.userData;
    if (d.workerRoot) workers.set(d.workerId, JSON.parse(d.workerRouteJSON));
    if (
      d.construction ||
      d.workerRoot ||
      d.workerJoint ||
      d.toolWorker ||
      d.machineMotion
    ) {
      entries.push({
        object,
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
        scale: object.scale.clone(),
      });
    }
  });
  const axes: Record<string, Vector3> = {
    x: new Vector3(1, 0, 0),
    y: new Vector3(0, 1, 0),
    z: new Vector3(0, 0, 1),
  };
  const q = new Quaternion();
  const tasks = new Map<string, WorkerState | undefined>();

  /** Deterministic absolute transforms; default time is also scrubbed by progress.
   * Supply elapsed seconds for continuous motion while scroll is stationary.
   */
  function update(
    progress: number,
    seconds = progress * 48,
    options: ConstructionOptions = {},
  ) {
    const p = Number.isFinite(progress)
      ? Math.max(0, Math.min(1, progress))
      : 0;
    const time = Number.isFinite(seconds) ? seconds : 0;
    for (const [id, list] of workers) tasks.set(id, sampleWorkerRoute(list, p));
    for (const { object: obj, position, quaternion, scale } of entries) {
      const d = obj.userData;
      obj.position.copy(position);
      obj.quaternion.copy(quaternion);
      obj.scale.copy(scale);
      let amount = 1;
      if (d.construction) {
        amount = siteBase.has(obj.name) ? 1 : smooth(p, d.start, d.end);
        if (d.retireStart !== undefined)
          amount *= 1 - smooth(p, d.retireStart, d.retireEnd);
        if (d.mode === 'uniform')
          obj.scale.multiplyScalar(Math.max(0.00001, amount));
        else if (d.mode === 'slide')
          obj.position.y = position.y + (d.installLift ?? 0.6) * (1 - amount);
        else obj.scale.y = scale.y * Math.max(0.00001, amount);
      }
      const task = tasks.get(d.workerId);
      const active =
        options.animateWorkers !== false &&
        options.workerActivity?.[d.workerId] !== false;
      if (d.workerRoot) {
        amount *= task?.visibility ?? 0;
        if (options.showWorkers === false) amount = 0;
        obj.scale.copy(scale).multiplyScalar(Math.max(0.00001, amount));
        if (task) {
          obj.position.set(
            task.position[0],
            task.position[2],
            -task.position[1],
          );
          obj.quaternion.setFromAxisAngle(axes.y, task.heading);
        }
      }
      if (d.workerJoint) {
        const angle = workerPose(obj.name, task, time, active);
        obj.quaternion.multiply(
          q.setFromAxisAngle(axes.x, angle - d.restAngle),
        );
      }
      if (d.toolWorker)
        amount = d.toolActivities
          .split(',')
          .includes(tasks.get(d.toolWorker)?.activity)
          ? 1
          : 0;
      const motion = d.machineMotion;
      if (motion) {
        const moving = options.animateMachinery !== false;
        if (motion === 'hoist')
          obj.position.y = -hoistLength(p, moving ? time : 0);
        else if (motion === 'cable')
          obj.scale.y = hoistLength(p, moving ? time : 0) + 0.22;
        else {
          const delta = !moving
            ? 0
            : motion === 'spin'
              ? time * (d.motionSpeed ?? 1)
              : (d.motionAmplitude ?? 0.3) *
                Math.sin(time * (d.motionSpeed ?? 1) + (d.motionPhase ?? 0));
          obj.quaternion.multiply(
            q.setFromAxisAngle(axes[d.motionAxis ?? 'x'], delta),
          );
        }
      }
      obj.visible = amount > 0.000001;
    }
  }
  update(0);
  return { update };
}
