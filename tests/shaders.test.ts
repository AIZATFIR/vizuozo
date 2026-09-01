import { describe, it, expect } from 'vitest';
import { fluidVertexShader, fluidFragmentShader } from '../src/visual/shaders/fluidShaders';
import { particleVertexShader, particleFragmentShader } from '../src/visual/shaders/particleShaders';
import { SemicolonGLSL } from '../src/visual/shaders/semicolonGlyph';

describe('GLSL Shaders Integrity', () => {
  it('should contain vertex shader position and uv mapping', () => {
    expect(fluidVertexShader).toContain('varying vec2 vUv;');
    expect(fluidVertexShader).toContain('gl_Position');
  });

  it('should contain required uniform definitions in fluidFragmentShader', () => {
    const requiredUniforms = [
      'uniform float uTime;',
      'uniform vec2 uResolution;',
      'uniform float uBass;',
      'uniform float uMids;',
      'uniform float uTreble;',
      'uniform float uTransient;',
      'uniform float uEnergy;',
      'uniform vec3 uColorPrimary;',
      'uniform float uFluidScale;',
      'uniform float uSemicolonVisibility;'
    ];

    requiredUniforms.forEach((u) => {
      expect(fluidFragmentShader).toContain(u);
    });
  });

  it('should contain semicolon SDF function in GLSL', () => {
    expect(SemicolonGLSL).toContain('float sdSemicolon(');
    expect(fluidFragmentShader).toContain('sdSemicolon(');
  });

  it('should contain particle shaders with vortex and jet logic', () => {
    expect(particleVertexShader).toContain('uVortexStrength');
    expect(particleVertexShader).toContain('aType');
    expect(particleFragmentShader).toContain('gl_PointCoord');
  });
});
