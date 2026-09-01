export const particleVertexShader = `
uniform float uTime;
uniform float uBass;
uniform float uMids;
uniform float uTreble;
uniform float uTransient;
uniform float uEnergy;
uniform float uVortexStrength;
uniform float uParticleSpeed;
uniform float uParticleSize;
uniform vec3 uColorGlow;
uniform vec3 uColorAccent;

attribute float aSize;
attribute float aPhase;
attribute vec3 aVelocity;
attribute float aType; // 0: ambient star, 1: orbital vortex, 2: jet filament

varying vec3 vColor;
varying float vAlpha;
varying float vType;

void main() {
    vType = aType;
    vec3 pos = position;
    
    float t = uTime * uParticleSpeed * 0.35 + aPhase;
    
    // 1. Orbital Vortex Motion (for Void and Cosmic modes)
    if (uVortexStrength > 0.01) {
        float r = length(pos.xy);
        float angle = atan(pos.y, pos.x) + (1.0 / (r + 0.35) + uBass * 0.6) * uVortexStrength * (aPhase * 0.4 + 0.6);
        
        if (aType == 1.0) {
            // Spiral arms
            pos.x = cos(angle) * r;
            pos.y = sin(angle) * r;
            pos.z += sin(t * 1.5 + r * 2.5) * 0.08 * (1.0 + uBass);
        } else if (aType == 2.0) {
            // Jet filaments shooting diagonally across the vortex (yin-yang reference)
            float jetDist = mod(t * 1.2 + aPhase * 2.0, 3.0) - 1.5;
            vec2 jetDir = normalize(vec2(0.85, -0.52));
            if (aPhase > 3.14) jetDir = -jetDir;
            
            pos.xy = jetDir * jetDist * 1.8 + vec2(-jetDir.y, jetDir.x) * sin(jetDist * 5.0) * 0.06;
            pos.z = cos(jetDist * 3.5) * 0.08;
        }
    } else {
        // Floating cosmic dust drift
        pos += sin(vec3(t * 0.6, t * 0.8, t * 0.7) + pos * 1.2) * (0.04 + uMids * 0.06);
    }
    
    // Treble & Transient spark expansion
    pos += aVelocity * (uTreble * 0.15 + uTransient * 0.25);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    float sizeMultiplier = 1.0 + uTreble * 0.8 + uTransient * 1.2;
    gl_PointSize = (aSize * uParticleSize * sizeMultiplier) * (260.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.2, 32.0);
    
    // Soft bioluminescent particle color
    vec3 col = mix(uColorGlow, uColorAccent, sin(aPhase + uTime * 0.5) * 0.5 + 0.5);
    if (aType == 2.0) {
        col = mix(col, uColorGlow * 1.2, 0.5);
    }
    vColor = col;
    vAlpha = clamp(0.25 + uEnergy * 0.45 + uTransient * 0.3, 0.15, 0.85);
}
`;

export const particleFragmentShader = `
varying vec3 vColor;
varying float vAlpha;
varying float vType;

void main() {
    // Soft circular point sprite with Gaussian falloff
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Eye-soothing soft gradient falloff
    float core = smoothstep(0.2, 0.0, dist);
    float halo = smoothstep(0.5, 0.0, dist);
    float alpha = (core * 0.4 + halo * 0.6) * vAlpha;
    
    vec3 col = vColor + vColor * (core * 0.35);
    gl_FragColor = vec4(col, alpha);
}
`;
