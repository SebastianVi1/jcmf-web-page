import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Group, Object3D } from 'three';
import { createConstructionController } from '../src/features/construction/construction-controller';
import {
  modelProgress,
  phaseIndex,
} from '../src/features/construction/progress';
import {
  sampleWorkerRoute,
  type RouteSegment,
} from '../src/features/construction/worker-routes';

describe('construction progress', () => {
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
