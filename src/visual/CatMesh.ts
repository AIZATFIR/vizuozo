import * as THREE from 'three';
import { AudioMetrics } from '../types';

export class CatMesh {
  public group: THREE.Group;
  private head: THREE.Mesh;
  private leftEar: THREE.Mesh;
  private rightEar: THREE.Mesh;
  private body: THREE.Mesh;
  private tail: THREE.Line;
  private whiskers: THREE.LineSegments;

  private bouncePhase = 0;

  constructor() {
    this.group = new THREE.Group();

    // Bioluminescent neon orchid wireframe
    const catMaterial = new THREE.MeshBasicMaterial({
      color: 0xe085d5,
      transparent: true,
      opacity: 0.65,
      wireframe: true
    });

    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd275,
      transparent: true,
      opacity: 0.9
    });

    // 1. Cat Body (Smooth ellipsoid)
    const bodyGeo = new THREE.SphereGeometry(0.35, 16, 12);
    bodyGeo.scale(1.0, 1.2, 0.9);
    this.body = new THREE.Mesh(bodyGeo, catMaterial);
    this.body.position.set(0, -0.3, 0);
    this.group.add(this.body);

    // 2. Cat Head (Sphere)
    const headGeo = new THREE.SphereGeometry(0.28, 16, 12);
    this.head = new THREE.Mesh(headGeo, catMaterial);
    this.head.position.set(0, 0.18, 0.05);
    this.group.add(this.head);

    // 3. Pointy Triangular Ears (Cone)
    const earGeo = new THREE.ConeGeometry(0.1, 0.22, 4);
    this.leftEar = new THREE.Mesh(earGeo, catMaterial);
    this.leftEar.position.set(-0.16, 0.42, 0.04);
    this.leftEar.rotation.z = 0.35;
    this.leftEar.rotation.x = -0.1;
    this.group.add(this.leftEar);

    this.rightEar = new THREE.Mesh(earGeo, catMaterial);
    this.rightEar.position.set(0.16, 0.42, 0.04);
    this.rightEar.rotation.z = -0.35;
    this.rightEar.rotation.x = -0.1;
    this.group.add(this.rightEar);

    // 4. Glowing Cat Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    eyeGeo.scale(1.0, 1.4, 0.5);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.09, 0.2, 0.26);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.09, 0.2, 0.26);

    const eyeGroup = new THREE.Group();
    eyeGroup.add(leftEye);
    eyeGroup.add(rightEye);
    this.group.add(eyeGroup);

    // 5. Whiskers (Line segments)
    const whiskerPositions = new Float32Array([
      // Left whiskers
      -0.08, 0.14, 0.25, -0.35, 0.16, 0.22,
      -0.08, 0.12, 0.25, -0.36, 0.10, 0.22,
      -0.08, 0.10, 0.25, -0.34, 0.05, 0.22,
      // Right whiskers
      0.08, 0.14, 0.25, 0.35, 0.16, 0.22,
      0.08, 0.12, 0.25, 0.36, 0.10, 0.22,
      0.08, 0.10, 0.25, 0.34, 0.05, 0.22
    ]);
    const whiskerGeo = new THREE.BufferGeometry();
    whiskerGeo.setAttribute('position', new THREE.BufferAttribute(whiskerPositions, 3));
    this.whiskers = new THREE.LineSegments(
      whiskerGeo,
      new THREE.LineBasicMaterial({ color: 0x9be8ff, transparent: true, opacity: 0.7 })
    );
    this.group.add(this.whiskers);

    // 6. Semicolon Curved Tail (Line curve)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.45, -0.1),
      new THREE.Vector3(0.2, -0.35, -0.2),
      new THREE.Vector3(0.35, -0.15, -0.15),
      new THREE.Vector3(0.3, 0.05, 0.0)
    ]);
    const tailPoints = curve.getPoints(24);
    const tailGeo = new THREE.BufferGeometry().setFromPoints(tailPoints);
    this.tail = new THREE.Line(
      tailGeo,
      new THREE.LineBasicMaterial({ color: 0xe085d5, linewidth: 2, transparent: true, opacity: 0.85 })
    );
    this.group.add(this.tail);

    // Initial scale and hidden state
    this.group.scale.set(1.4, 1.4, 1.4);
    this.group.position.set(0, -0.1, 0.5);
    this.group.visible = false;
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public update(metrics: AudioMetrics, delta: number, time: number): void {
    if (!this.group.visible) return;

    this.bouncePhase += delta * (4.0 + metrics.bass * 8.0);

    // 1. Bass bounce & squash/stretch
    const bounce = Math.abs(Math.sin(this.bouncePhase));
    const bassScale = 1.0 + metrics.bass * 0.35 + metrics.transient * 0.2;
    const squash = 1.0 - bounce * 0.15;
    const stretch = 1.0 + bounce * 0.2;

    this.group.position.y = -0.1 + bounce * (0.15 + metrics.bass * 0.25);
    this.body.scale.set(squash * bassScale, stretch * bassScale, squash);

    // 2. Mids head nodding & rotation
    this.head.position.y = 0.18 + bounce * 0.08 + metrics.mids * 0.05;
    this.head.rotation.z = Math.sin(time * 3.0) * (0.1 + metrics.mids * 0.2);
    this.head.rotation.x = Math.sin(this.bouncePhase * 0.5) * 0.1;

    // 3. Treble ear twitching
    this.leftEar.rotation.z = 0.35 + Math.sin(time * 12.0) * metrics.treble * 0.4;
    this.rightEar.rotation.z = -0.35 - Math.cos(time * 14.0) * metrics.treble * 0.4;

    // 4. Tail swish
    this.tail.rotation.z = Math.sin(time * 5.0) * (0.3 + metrics.bass * 0.6);
    this.tail.rotation.y = Math.cos(time * 4.0) * 0.25;

    // 5. Gentle hovering group sway
    this.group.rotation.y = Math.sin(time * 0.8) * 0.15;
  }
}
