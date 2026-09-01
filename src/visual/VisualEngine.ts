import * as THREE from 'three';
import { fluidVertexShader, fluidFragmentShader } from './shaders/fluidShaders';
import { particleVertexShader, particleFragmentShader } from './shaders/particleShaders';
import { PRESETS } from './presets';
import { CatMesh } from './CatMesh';
import { AudioMetrics, QualityLevel, VisualPresetConfig, VisualPresetId } from '../types';

export class VisualEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Fluid Shader Plane
  private fluidMesh: THREE.Mesh;
  private fluidMaterial: THREE.ShaderMaterial;

  // Particle System
  private particleGeometry: THREE.BufferGeometry;
  private particleMaterial: THREE.ShaderMaterial;
  private particlePoints: THREE.Points;

  // 3D Elements
  private catMesh: CatMesh;

  // State & Presets
  private currentPreset: VisualPresetConfig;
  private targetPreset: VisualPresetConfig;
  private presetLerpFactor = 1.0;
  private activePalette: {
    primary: THREE.Vector3;
    secondary: THREE.Vector3;
    accent: THREE.Vector3;
    background: THREE.Vector3;
    glow: THREE.Vector3;
  };

  // Performance & Quality
  private quality: QualityLevel = 'auto';
  private frameCount = 0;
  private lastFpsCheck = performance.now();
  private clock = new THREE.Clock();

  // Mouse Tracking
  private mousePos = new THREE.Vector2(0, 0);
  private targetMousePos = new THREE.Vector2(0, 0);

  // Resize Observer
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
      depth: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.z = 2.5;

    // 3. Initialize Presets
    this.currentPreset = { ...PRESETS.fluid };
    this.targetPreset = { ...PRESETS.fluid };
    this.activePalette = {
      primary: new THREE.Vector3(...this.currentPreset.palette.primary),
      secondary: new THREE.Vector3(...this.currentPreset.palette.secondary),
      accent: new THREE.Vector3(...this.currentPreset.palette.accent),
      background: new THREE.Vector3(...this.currentPreset.palette.background),
      glow: new THREE.Vector3(...this.currentPreset.palette.glow)
    };

    // 4. Create Background Fluid Quad
    this.fluidMaterial = new THREE.ShaderMaterial({
      vertexShader: fluidVertexShader,
      fragmentShader: fluidFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(container.clientWidth, container.clientHeight)
        },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uBass: { value: 0 },
        uMids: { value: 0 },
        uTreble: { value: 0 },
        uTransient: { value: 0 },
        uEnergy: { value: 0 },
        uColorPrimary: { value: this.activePalette.primary },
        uColorSecondary: { value: this.activePalette.secondary },
        uColorAccent: { value: this.activePalette.accent },
        uColorBg: { value: this.activePalette.background },
        uColorGlow: { value: this.activePalette.glow },
        uFluidScale: { value: this.currentPreset.fluidScale },
        uFluidSpeed: { value: this.currentPreset.fluidSpeed },
        uFluidViscosity: { value: this.currentPreset.fluidViscosity },
        uSemicolonVisibility: { value: this.currentPreset.semicolonVisibility },
        uArchPresence: { value: this.currentPreset.archPresence },
        uChromaticAberration: { value: this.currentPreset.chromaticAberration },
        uNoiseOctaves: { value: this.currentPreset.noiseOctaves }
      },
      depthWrite: false,
      depthTest: false
    });

    const quadGeo = new THREE.PlaneGeometry(20, 20);
    this.fluidMesh = new THREE.Mesh(quadGeo, this.fluidMaterial);
    this.fluidMesh.position.z = -1.0;
    this.scene.add(this.fluidMesh);

    // 5. Create GPU Particle System (Bounded strictly in center circle)
    const maxParticles = 6000;
    const positions = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const phases = new Float32Array(maxParticles);
    const velocities = new Float32Array(maxParticles * 3);
    const types = new Float32Array(maxParticles);

    for (let i = 0; i < maxParticles; i++) {
      const idx = i * 3;
      // Determine particle type:
      // 50% dual-core spiral vortex, 25% binary jet filaments, 25% ambient stardust
      const rand = Math.random();
      const pType = rand < 0.50 ? 1 : rand < 0.75 ? 2 : 0;
      types[i] = pType;

      if (pType === 1) {
        // Dual-core spiral disk - bounded radius r in [0.08, 0.75]
        const rad = 0.08 + Math.pow(Math.random(), 1.5) * 0.68;
        const theta = Math.random() * Math.PI * 2;
        positions[idx] = Math.cos(theta) * rad;
        positions[idx + 1] = Math.sin(theta) * rad;
        positions[idx + 2] = (Math.random() - 0.5) * 0.15;
      } else if (pType === 2) {
        // Jet filaments bursting from the binary centers
        const isCoreA = Math.random() > 0.5;
        const baseAngle = isCoreA ? 0.4 : 3.54;
        const spread = (Math.random() - 0.5) * 0.3;
        const dist = 0.1 + Math.random() * 0.65;
        positions[idx] = Math.cos(baseAngle + spread) * dist;
        positions[idx + 1] = Math.sin(baseAngle + spread) * dist;
        positions[idx + 2] = (Math.random() - 0.5) * 0.1;
      } else {
        // Ambient stardust concentrated in center circle
        const rad = Math.sqrt(Math.random()) * 0.82;
        const theta = Math.random() * Math.PI * 2;
        positions[idx] = Math.cos(theta) * rad;
        positions[idx + 1] = Math.sin(theta) * rad;
        positions[idx + 2] = (Math.random() - 0.5) * 0.2;
      }

      sizes[i] = 1.0 + Math.random() * 2.8;
      phases[i] = Math.random() * Math.PI * 2;
      velocities[idx] = (Math.random() - 0.5) * 0.08;
      velocities[idx + 1] = (Math.random() - 0.5) * 0.08;
      velocities[idx + 2] = (Math.random() - 0.5) * 0.08;
    }

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    this.particleGeometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    this.particleGeometry.setAttribute('aType', new THREE.BufferAttribute(types, 1));

    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMids: { value: 0 },
        uTreble: { value: 0 },
        uTransient: { value: 0 },
        uEnergy: { value: 0 },
        uVortexStrength: { value: this.currentPreset.vortexStrength },
        uParticleSpeed: { value: this.currentPreset.particleSpeed },
        uParticleSize: { value: this.currentPreset.particleSize },
        uColorGlow: { value: this.activePalette.glow },
        uColorAccent: { value: this.activePalette.accent }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particlePoints = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particlePoints);

    // 6. Cat Mesh for Cat preset
    this.catMesh = new CatMesh();
    this.scene.add(this.catMesh.group);

    // 7. Mouse and Resize Listeners
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
    this.resizeObserver.observe(this.container);
  }

  private onPointerMove(e: PointerEvent): void {
    this.targetMousePos.set(e.clientX, window.innerHeight - e.clientY);
  }

  private onResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.fluidMaterial.uniforms.uResolution.value.set(width, height);
  }

  public setPreset(id: VisualPresetId): void {
    const target = PRESETS[id];
    if (!target) return;
    this.targetPreset = { ...target };
    this.presetLerpFactor = 0.0;

    // Toggle Cat mesh visibility
    this.catMesh.setVisible(id === 'cat');
  }

  public getPreset(): VisualPresetConfig {
    return this.targetPreset;
  }

  public setQuality(quality: QualityLevel): void {
    this.quality = quality;
    if (quality === 'low') {
      this.renderer.setPixelRatio(1.0);
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(1.25);
    } else if (quality === 'high') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    }
  }

  public render(metrics: AudioMetrics): void {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Mouse smooth interpolation
    this.mousePos.lerp(this.targetMousePos, 0.08);

    // 2. Preset Transition Interpolation (Smooth morphing between palettes & settings)
    if (this.presetLerpFactor < 1.0) {
      this.presetLerpFactor = Math.min(1.0, this.presetLerpFactor + delta * 1.5);
      const t = this.presetLerpFactor;

      const lerpVec3 = (v: THREE.Vector3, src: [number, number, number], dst: [number, number, number]) => {
        v.set(
          src[0] + (dst[0] - src[0]) * t,
          src[1] + (dst[1] - src[1]) * t,
          src[2] + (dst[2] - src[2]) * t
        );
      };

      lerpVec3(this.activePalette.primary, this.currentPreset.palette.primary, this.targetPreset.palette.primary);
      lerpVec3(this.activePalette.secondary, this.currentPreset.palette.secondary, this.targetPreset.palette.secondary);
      lerpVec3(this.activePalette.accent, this.currentPreset.palette.accent, this.targetPreset.palette.accent);
      lerpVec3(this.activePalette.background, this.currentPreset.palette.background, this.targetPreset.palette.background);
      lerpVec3(this.activePalette.glow, this.currentPreset.palette.glow, this.targetPreset.palette.glow);

      const lerpScalar = (src: number, dst: number) => src + (dst - src) * t;
      this.fluidMaterial.uniforms.uFluidScale.value = lerpScalar(this.currentPreset.fluidScale, this.targetPreset.fluidScale);
      this.fluidMaterial.uniforms.uFluidSpeed.value = lerpScalar(this.currentPreset.fluidSpeed, this.targetPreset.fluidSpeed);
      this.fluidMaterial.uniforms.uFluidViscosity.value = lerpScalar(this.currentPreset.fluidViscosity, this.targetPreset.fluidViscosity);
      this.fluidMaterial.uniforms.uSemicolonVisibility.value = lerpScalar(this.currentPreset.semicolonVisibility, this.targetPreset.semicolonVisibility);
      this.fluidMaterial.uniforms.uArchPresence.value = lerpScalar(this.currentPreset.archPresence, this.targetPreset.archPresence);
      this.fluidMaterial.uniforms.uChromaticAberration.value = lerpScalar(this.currentPreset.chromaticAberration, this.targetPreset.chromaticAberration);
      this.fluidMaterial.uniforms.uNoiseOctaves.value = lerpScalar(this.currentPreset.noiseOctaves, this.targetPreset.noiseOctaves);

      this.particleMaterial.uniforms.uVortexStrength.value = lerpScalar(this.currentPreset.vortexStrength, this.targetPreset.vortexStrength);
      this.particleMaterial.uniforms.uParticleSpeed.value = lerpScalar(this.currentPreset.particleSpeed, this.targetPreset.particleSpeed);
      this.particleMaterial.uniforms.uParticleSize.value = lerpScalar(this.currentPreset.particleSize, this.targetPreset.particleSize);

      if (t >= 1.0) {
        this.currentPreset = { ...this.targetPreset };
      }
    }

    // 3. Update Fluid Uniforms
    this.fluidMaterial.uniforms.uTime.value = time;
    this.fluidMaterial.uniforms.uMouse.value.copy(this.mousePos);
    this.fluidMaterial.uniforms.uBass.value = metrics.bass;
    this.fluidMaterial.uniforms.uMids.value = metrics.mids;
    this.fluidMaterial.uniforms.uTreble.value = metrics.treble;
    this.fluidMaterial.uniforms.uTransient.value = metrics.transient;
    this.fluidMaterial.uniforms.uEnergy.value = metrics.energy;

    // 4. Update Particle Uniforms
    this.particleMaterial.uniforms.uTime.value = time;
    this.particleMaterial.uniforms.uBass.value = metrics.bass;
    this.particleMaterial.uniforms.uMids.value = metrics.mids;
    this.particleMaterial.uniforms.uTreble.value = metrics.treble;
    this.particleMaterial.uniforms.uTransient.value = metrics.transient;
    this.particleMaterial.uniforms.uEnergy.value = metrics.energy;

    // Dynamic particle draw count
    this.particleGeometry.setDrawRange(0, Math.floor(this.currentPreset.particleCount));

    // 5. Update 3D Cat
    this.catMesh.update(metrics, delta, time);

    // 6. Camera breathing reaction to bass & transients
    const camBassShift = metrics.bass * 0.15 + metrics.transient * 0.1;
    this.camera.position.z = 2.5 - camBassShift;
    this.camera.rotation.z = Math.sin(time * 0.2) * 0.02 * (1.0 + metrics.mids);

    // 7. Render Frame
    this.renderer.render(this.scene, this.camera);

    // 8. Auto FPS / Performance Governor
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsCheck > 2000) {
      const fps = (this.frameCount * 1000) / (now - this.lastFpsCheck);
      if (this.quality === 'auto') {
        if (fps < 45 && this.renderer.getPixelRatio() > 1.0) {
          this.renderer.setPixelRatio(1.0);
        } else if (fps > 58 && this.renderer.getPixelRatio() < 1.75) {
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        }
      }
      this.frameCount = 0;
      this.lastFpsCheck = now;
    }
  }

  public destroy(): void {
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    this.fluidMaterial.dispose();
    this.particleMaterial.dispose();
    this.particleGeometry.dispose();
  }
}
