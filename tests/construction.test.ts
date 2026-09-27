import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Group, Object3D } from 'three';
import { createConstructionController } from '../src/features/construction/construction-controller';
import {
  brandReveal,
  cameraPose,
  createSteering,
  displayYaw,
  driftFade,
  modelProgress,
  phaseIndex,
  sequenceSweep,
  sequenceTurn,
  settleAmount,
  steerTuning,
  viewElevation,
  wrapPi,
} from '../src/features/construction/progress';
import {
  sampleWorkerRoute,
  createProgressSmoother,
  workerPose,
  type RouteSegment,
} from '../src/features/construction/worker-routes';

describe('construction progress', () => {
  it('settles at the same rate on slow and fast renderers and follows reversals', () => {
    const slow = createProgressSmoother();
    const fast = createProgressSmoother();
    for (let i = 0; i < 6; i++) slow.step(1, 1 / 10);
    for (let i = 0; i < 36; i++) fast.step(1, 1 / 60);
    assert.ok(Math.abs(slow.value - fast.value) < 0.00001);
    assert.ok(slow.value > 0.99);
    for (let i = 0; i < 10; i++) slow.step(0, 0.1);
    assert.ok(slow.value < 0.0001);
    assert.equal(slow.step(0.7, 0.01, true), 0.7);
    assert.ok(Number.isFinite(slow.step(NaN, NaN)));
  });

  it('animates different work tasks at fixed construction progress', () => {
    const state = {
      position: [0, 0, 0],
      heading: 0,
      weight: 1,
      phase: 0,
      visibility: 1,
      segment: 0,
      activity: 'hammer',
    };
    const first = workerPose('Worker_09_Shoulder_R', state, 0, true);
    assert.notEqual(
      workerPose('Worker_09_Shoulder_R', state, 0.5, true),
      first,
    );
    assert.notEqual(
      workerPose(
        'Worker_09_Shoulder_R',
        { ...state, activity: 'drill' },
        0,
        true,
      ),
      first,
    );
    assert.equal(
      workerPose('Worker_09_Shoulder_R', state, 0, false),
      workerPose('Worker_09_Shoulder_R', state, 0.5, false),
    );
  });
  it('moves the camera smoothly and reversibly from overhead to the facade', () => {
    const start = cameraPose(0);
    const finish = cameraPose(1);
    const middle = cameraPose(0.5);
    assert.ok(
      start.elevation > middle.elevation && middle.elevation > finish.elevation,
    );
    assert.ok(
      start.azimuth < middle.azimuth && middle.azimuth < finish.azimuth,
    );
    assert.deepEqual(cameraPose(0.5), middle);
    assert.deepEqual(cameraPose(NaN), start);
    assert.deepEqual(cameraPose(2), finish);
  });
  it('reveals the brand only near completion and reverses with progress', () => {
    assert.equal(brandReveal(0), 0);
    assert.equal(brandReveal(0.78), 0);
    assert.ok(Math.abs(brandReveal(0.88) - 0.5) < 1e-8);
    assert.equal(brandReveal(1), 1);
    assert.equal(brandReveal(0.5), 0);
  });
  it('turns the building right to left with the scroll and finishes frontal', () => {
    // The sweep starts from the right side and ends exactly on the facade.
    assert.equal(sequenceSweep(1), 0);
    assert.equal(sequenceSweep(NaN), sequenceTurn);
    assert.ok(sequenceSweep(0) > 1.5);
    let previous = Infinity;
    for (let i = 0; i <= 20; i++) {
      const sweep = sequenceSweep(i / 20);
      assert.ok(sweep < previous);
      previous = sweep;
    }
    // The finale window zeroes the idle drift and is fully reversible.
    assert.equal(settleAmount(0), 0);
    assert.equal(settleAmount(1), 1);
    assert.equal(driftFade(0), 1);
    assert.equal(driftFade(1), 0);
    const azimuth = cameraPose(1).azimuth;
    // The finished frame is the frontal facade however long the visitor idled.
    assert.equal(displayYaw(azimuth, 1, 12, 0), azimuth);
    assert.ok(
      Math.abs(wrapPi(displayYaw(azimuth, 1, 12, 0.2) - azimuth - 0.2)) < 1e-12,
    );
    // Early sequence keeps the turned pose; scrolling back restores it.
    assert.ok(displayYaw(azimuth, 0, 0, 0) > azimuth + 1.5);
    const back = displayYaw(azimuth, 0.95, 2, 0);
    assert.ok(back > azimuth && back < azimuth + sequenceTurn);
  });
  it('steers fluidly while held, glides on tap, and clamps the tilt', () => {
    const steering = createSteering();
    steering.press('right');
    let yaw = 0;
    for (let i = 0; i < 60; i++) yaw = steering.step(1 / 60).yaw;
    // Continuous turn near the tuned rate while held, not a single step.
    assert.ok(yaw > 0.4 && yaw < steerTuning.yawRate * 1.05);
    steering.release('right');
    for (let i = 0; i < 60; i++) yaw = steering.step(1 / 60).yaw;
    const stopped = steering.step(1 / 60);
    assert.ok(Math.abs(stopped.yaw - yaw) < 1e-3);
    assert.equal(stopped.active, false);
    // A quick tap still moves the model a perceptible amount.
    const tap = createSteering();
    tap.press('down');
    tap.release('down');
    let tilt = 0;
    for (let i = 0; i < 120; i++) tilt = tap.step(1 / 60).tilt;
    assert.ok(tilt < -0.05 && tilt > steerTuning.tiltMin);
    // Holding clamps at the limit instead of flying past it.
    const crank = createSteering();
    crank.press('up');
    let value = 0;
    for (let i = 0; i < 300; i++) value = crank.step(1 / 60).tilt;
    assert.equal(value, steerTuning.tiltMax);
    assert.ok(Number.isFinite(value));
    // The documented finale elevation survives an untouched tilt.
    assert.ok(
      Math.abs(viewElevation(cameraPose(1).elevation, 0) - 0.42) < 1e-12,
    );
  });
  it('shows the site before scrolling and still excavates it in order', () => {
    const root = new Group();
    const soil = new Object3D();
    soil.name = 'Excavation_Soil_To_Remove';
    soil.userData = {
      construction: true,
      start: 0,
      end: 0.035,
      retireStart: 0.04,
      retireEnd: 0.13,
    };
    root.add(soil);
    const controller = createConstructionController(root);
    assert.equal(soil.visible, true);
    assert.equal(soil.scale.y, 1);
    controller.update(0.15);
    assert.equal(soil.visible, false);
    controller.update(0);
    assert.equal(soil.visible, true);
    assert.equal(soil.scale.y, 1);
  });
  it('reserves the last tenth of scrolling for the finished building', () => {
    assert.equal(modelProgress(0), 0);
    assert.equal(modelProgress(0.45), 0.5);
    assert.equal(modelProgress(0.9), 1);
    assert.equal(modelProgress(1), 1);
    assert.equal(modelProgress(-1), 0);
    assert.equal(modelProgress(NaN), 0);
    assert.equal(phaseIndex(0), 0);
    assert.equal(phaseIndex(0.4), 3);
    assert.equal(phaseIndex(1), 6);
  });

  it('restores exactly the same structure and machinery after reversing', () => {
    const root = new Group();
    const slab = new Object3D();
    slab.position.set(2, 4, 3);
    slab.userData = { construction: true, start: 0.1, end: 0.5, mode: 'slide' };
    const crane = new Object3D();
    crane.userData = {
      machineMotion: 'spin',
      motionAxis: 'y',
      motionSpeed: 0.2,
    };
    root.add(slab, crane);
    const controller = createConstructionController(root);
    const snapshot = () =>
      root.children.map((o) => ({
        position: o.position.toArray(),
        rotation: o.quaternion.toArray(),
        scale: o.scale.toArray(),
        visible: o.visible,
      }));
    controller.update(0.3);
    const initial = snapshot();
    controller.update(1);
    controller.update(0.8);
    controller.update(0.3);
    assert.deepEqual(snapshot(), initial);
    controller.update(0);
    assert.equal(slab.visible, false);
    controller.update(1);
    assert.deepEqual(slab.position.toArray(), [2, 4, 3]);
    controller.update(NaN);
    assert.ok(crane.quaternion.toArray().every(Number.isFinite));
  });

  it('keeps worker routes deterministic and hides them outside their visit', () => {
    const route: RouteSegment[] = [
      {
        start: 0.1,
        end: 0.8,
        path: [
          [0, 0, 0],
          [4, 0, 0],
        ],
        lengths: [0, 4],
        length: 4,
        activity: 'walk',
        heading: 0,
        distance: 0,
      },
    ];
    const middle = sampleWorkerRoute(route, 0.45)!;
    assert.ok(Math.abs(middle.position[0] - 2) < 1e-8);
    sampleWorkerRoute(route, 0.75);
    assert.deepEqual(sampleWorkerRoute(route, 0.45), middle);
    assert.equal(sampleWorkerRoute(route, 0)!.visibility, 0);
    assert.equal(sampleWorkerRoute(route, 1)!.visibility, 0);
  });
});
