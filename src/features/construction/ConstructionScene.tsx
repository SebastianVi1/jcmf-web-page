import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Canvas, addAfterEffect, useFrame, useThree } from '@react-three/fiber';
import {
  AgXToneMapping,
  Box3,
  Color,
  Group,
  Mesh,
  Object3D,
  OrthographicCamera,
  PMREMGenerator,
  Sphere,
  Texture,
  Vector3,
  type Material,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createConstructionController } from './construction-controller';
import { createProgressSmoother } from './worker-routes';
import { brandReveal, cameraPose, modelProgress, phaseIndex } from './progress';
import type { SceneProps } from './ConstructionIsland';

gsap.registerPlugin(ScrollTrigger);

function disposeModel(model: Object3D) {
  const geometries = new Set<Mesh['geometry']>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof Texture) textures.add(value);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => {
    texture.dispose();
    if (
      typeof ImageBitmap !== 'undefined' &&
      texture.image instanceof ImageBitmap
    )
      texture.image.close();
  });
}

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Building({
  model,
  host,
  onReady,
  onError,
  phases,
  paused,
}: SceneProps & { model: Object3D }) {
  const { camera, gl, scene, invalidate, size } = useThree();
  const progress = useRef({ value: 0 });
  const smoothing = useMemo(() => createProgressSmoother(0), [model]);
  const lastFrame = useRef(0);
  const publishProgress = useRef<(p: number) => void>(() => {});
  const visible = useRef(true);
  const rendered = useRef(false);
  const pivot = useRef<Group>(null);
  const pose = useRef({ time: 0, activity: 0 });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const syncMotion = useRef<() => void>(() => {});
  const controller = useMemo(
    () => createConstructionController(model),
    [model],
  );
  const bounds = useMemo(() => {
    const result = new Box3();
    const piece = new Box3();
    // Include temporary cranes and access towers, not only the completed building.
    for (let step = 0; step <= 20; step++) {
      controller.update(step / 20);
      model.updateMatrixWorld(true);
      model.traverseVisible((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.computeBoundingBox();
        piece
          .copy(object.geometry.boundingBox!)
          .applyMatrix4(object.matrixWorld);
        result.union(piece);
      });
    }
    controller.update(0);
    return result;
  }, [model, controller]);
  const sphere = useMemo(
    () => bounds.getBoundingSphere(new Sphere()),
    [bounds],
  );
  const center = useMemo(() => bounds.getCenter(new Vector3()), [bounds]);
  const orbitRadius = useMemo(
    () =>
      Math.hypot(
        Math.max(
          Math.abs(bounds.min.x - center.x),
          Math.abs(bounds.max.x - center.x),
        ),
        Math.max(
          Math.abs(bounds.min.z - center.z),
          Math.abs(bounds.max.z - center.z),
        ),
      ),
    [bounds, center],
  );
  const offset = useMemo(() => new Vector3(), []);
  const [lights, setLights] = useState({
    sky: '',
    ground: '',
    key: '',
    exposure: 0,
  });

  useEffect(() => {
    const environment = new RoomEnvironment();
    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(environment, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.55;
    environment.dispose();
    pmrem.dispose();
    const theme = () => {
      const css = getComputedStyle(host);
      setLights({
        sky: css.getPropertyValue('--construction-light-sky').trim(),
        ground: css.getPropertyValue('--construction-light-ground').trim(),
        key: css.getPropertyValue('--construction-light-key').trim(),
        exposure: Number(css.getPropertyValue('--construction-exposure')),
      });
      invalidate();
    };
    theme();
    const observer = new MutationObserver(theme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    gl.domElement.setAttribute('aria-hidden', 'true');
    return () => {
      observer.disconnect();
      gl.domElement.removeEventListener('webglcontextlost', lost);
      scene.environment = null;
      target.dispose();
    };
  }, [gl, host, invalidate, onError, scene]);

  useEffect(() => {
    gl.toneMapping = AgXToneMapping;
    gl.toneMappingExposure = lights.exposure;
    invalidate();
  }, [lights, gl, invalidate]);

  useEffect(() => {
    const stage = host.querySelector<HTMLElement>('.construction-stage')!;
    const meter = host.querySelector<HTMLElement>('[data-construction-meter]')!;
    const phase = host.querySelector<HTMLElement>('[data-construction-phase]')!;
    let lastPhase = -1;
    let idle: gsap.core.Tween | undefined;
    let activity: gsap.core.Tween | undefined;
    const updateMotion = () => {
      const running = visible.current && !pausedRef.current;
      idle?.paused(!running);
      activity?.paused(!running || document.hidden);
      host.dataset.idle = running ? 'running' : 'paused';
    };
    const publish = (p: number) => {
      host.dataset.progress = p.toFixed(4);
      host.style.setProperty(
        '--construction-brand-reveal',
        String(brandReveal(p)),
      );
      meter.style.transform = `scaleX(${p})`;
      const index = phaseIndex(p);
      if (index !== lastPhase) {
        phase.textContent = phases[index];
        lastPhase = index;
      }
    };
    publishProgress.current = publish;
    const update = () => {
      if (visible.current) invalidate();
    };
    const context = gsap.context(() => {
      // Floating repeats independently of the workers' finite activity interval.
      idle = gsap.to(pose.current, {
        time: 120,
        duration: 120,
        repeat: -1,
        ease: 'none',
        paused: true,
        onUpdate: () => invalidate(),
      });
      activity = gsap.to(pose.current, {
        activity: 120,
        duration: 120,
        ease: 'none',
        paused: true,
        onUpdate: () => invalidate(),
      });
      // Refresh must not capture the current progress as a new animation start.
      gsap.fromTo(
        progress.current,
        { value: 0 },
        {
          value: 1,
          ease: 'none',
          onUpdate: update,
          scrollTrigger: {
            trigger: host,
            start: () =>
              `top ${parseFloat(getComputedStyle(stage).top) || 0}px`,
            end: () =>
              `+=${Math.max(1, host.offsetHeight - stage.offsetHeight)}`,
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: update,
          },
        },
      );
    }, host);
    syncMotion.current = updateMotion;
    const resize = new ResizeObserver(() => ScrollTrigger.refresh());
    resize.observe(stage);
    const intersection = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      updateMotion();
      if (visible.current) invalidate();
    });
    intersection.observe(gl.domElement);
    document.addEventListener('visibilitychange', updateMotion);
    updateMotion();
    update();
    return () => {
      context.revert();
      syncMotion.current = () => {};
      host.style.removeProperty('--construction-brand-reveal');
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', updateMotion);
    };
  }, [host, phases, invalidate, gl]);

  useEffect(() => {
    syncMotion.current();
  }, [paused]);

  useEffect(
    () =>
      addAfterEffect(() => {
        if (!rendered.current || !host.isConnected) return;
        rendered.current = false;
        onReady();
      }),
    [host, onReady],
  );

  const ready = useRef(false);
  useFrame(() => {
    const now = performance.now();
    const dt = lastFrame.current ? (now - lastFrame.current) / 1000 : 1 / 60;
    lastFrame.current = now;
    const displayed = smoothing.step(progress.current.value, dt);
    if (displayed !== progress.current.value && visible.current) invalidate();
    const p = modelProgress(displayed);
    publishProgress.current(p);
    controller.update(p, p * 48 + pose.current.activity);
    const yaw = (pose.current.time * Math.PI) / 60;
    const lift = Math.sin((pose.current.time * Math.PI * 2) / 7.5) * 0.9;
    if (pivot.current) {
      pivot.current.rotation.y = yaw;
      pivot.current.position.y = lift;
    }
    const ortho = camera as OrthographicCamera;
    const { azimuth, elevation } = cameraPose(p);
    offset.set(
      Math.sin(azimuth) * 50,
      Math.tan(elevation) * 50,
      Math.cos(azimuth) * 50,
    );
    ortho.position.copy(center).add(offset);
    ortho.lookAt(center);
    ortho.updateMatrixWorld();
    // Fit the whole turn, including the crane, without zooming as the model rotates.
    const projectedHeight =
      (bounds.max.y - bounds.min.y + 1.8) * Math.cos(elevation) +
      2 * orbitRadius * Math.sin(elevation);
    const height =
      Math.max(
        projectedHeight,
        (2 * orbitRadius) / (size.width / size.height),
      ) * 1.12;
    ortho.left = (-height * size.width) / size.height / 2;
    ortho.right = -ortho.left;
    const framingOffset = size.width <= 600 ? 0 : -height * 0.02;
    ortho.top = height / 2 + framingOffset;
    ortho.bottom = -height / 2 + framingOffset;
    ortho.near = 0.1;
    ortho.far = Math.max(200, sphere.radius * 8);
    ortho.updateProjectionMatrix();
    gl.domElement.dataset.progress = p.toFixed(4);
    gl.domElement.dataset.frames = String(gl.info.render.frame);
    gl.domElement.dataset.yaw = yaw.toFixed(5);
    gl.domElement.dataset.lift = lift.toFixed(5);
    gl.domElement.dataset.azimuth = azimuth.toFixed(5);
    gl.domElement.dataset.elevation = elevation.toFixed(5);
    if (!ready.current && lights.sky) {
      ready.current = true;
      rendered.current = true;
    }
  });

  return (
    <>
      {lights.sky && (
        <>
          <hemisphereLight
            args={[new Color(lights.sky), new Color(lights.ground), 0.65]}
          />
          <directionalLight
            color={lights.key}
            intensity={2.5}
            position={[-20, 30, 10]}
          />
        </>
      )}
      <group ref={pivot} position={[center.x, 0, center.z]}>
        <group position={[-center.x, 0, -center.z]}>
          <primitive object={model} dispose={null} />
        </group>
      </group>
    </>
  );
}

export default function ConstructionScene(props: SceneProps) {
  const [model, setModel] = useState<Object3D | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    let owned: Object3D | undefined;
    async function load() {
      try {
        const response = await fetch('/models/building.glb', {
          signal: abort.signal,
        });
        if (!response.ok) throw new Error('Model unavailable');
        const gltf = await new GLTFLoader().parseAsync(
          await response.arrayBuffer(),
          '/models/',
        );
        if (abort.signal.aborted) {
          disposeModel(gltf.scene);
          return;
        }
        owned = gltf.scene;
        setModel(owned);
      } catch (error) {
        if (!abort.signal.aborted) {
          console.warn('Construction model could not be loaded', error);
          props.onError();
        }
      }
    }
    void load();
    return () => {
      abort.abort();
      if (owned) disposeModel(owned);
    };
  }, [props.onError]);

  if (!model) return null;
  return (
    <SceneBoundary onError={props.onError}>
      <Canvas
        orthographic
        frameloop="demand"
        dpr={window.innerWidth <= 900 ? 1 : Math.min(devicePixelRatio, 1.5)}
        gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
      >
        <Building {...props} model={model} />
      </Canvas>
    </SceneBoundary>
  );
}
