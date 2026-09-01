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
attribute float aType; // 0: ambient star dust, 1: dual-core vortex orbit, 2: binary jet filaments

varying vec3 vColor;
varying float vAlpha;
varying float vCoreIntensity;

void main() {
    vec3 pos = position;
    
    float t = uTime * uParticleSpeed * 0.45 + aPhase;
    float coreDist = 0.0;
    
    // Dual Binary Attractor Centers (orbiting around center (0,0))
    float binaryOrbitRadius = 0.28 + uBass * 0.1;
    float binaryAngle = uTime * 0.5 * (1.0 + uVortexStrength * 0.5);
    vec2 coreA = vec2(cos(binaryAngle), sin(binaryAngle)) * binaryOrbitRadius;
    vec2 coreB = -coreA;

    if (uVortexStrength > 0.01) {
        if (aType == 1.0) {
            // Dual-Core Spiral Vortex Orbit
            // Determine attraction to closer binary core
            float distA = length(pos.xy - coreA);
            float distB = length(pos.xy - coreB);
            vec2 targetCore = distA < distB ? coreA : coreB;
            float minDist = min(distA, distB);
            
            // Orbital swirl around the binary system
            float r = length(pos.xy);
            float rotSpeed = (0.9 / (r + 0.22) + uBass * 0.8) * uVortexStrength;
            float angle = atan(pos.y, pos.x) + rotSpeed * 0.035 * (sin(aPhase * 3.0 + t) * 0.5 + 1.0);
            
            pos.x = cos(angle) * r;
            pos.y = sin(angle) * r;
            
            // Gentle gravitational pull towards active attractor
            pos.xy = mix(pos.xy, targetCore + normalize(pos.xy - targetCore + 0.001) * 0.15, 0.18);
            pos.z += sin(t * 1.8 + r * 3.0) * 0.06 * (1.0 + uBass);
            
            coreDist = minDist;
        } else if (aType == 2.0) {
            // Binary Jet Filaments (two luminous opposite jet streams bursting from the binary cores)
            float isCoreA = step(3.14159, aPhase);
            vec2 emitter = isCoreA > 0.5 ? coreA : coreB;
            vec2 jetDir = normalize(emitter); // Radial outward jet direction
            // Rotate jet slightly with momentum
            mat2 rot = mat2(cos(0.35), sin(0.35), -sin(0.35), cos(0.35));
            jetDir = rot * jetDir;
            
            float jetProgress = mod(t * 0.8 + aPhase * 0.5, 1.0); // 0.0 to 1.0
            float jetLen = 0.05 + jetProgress * 0.65;
            
            // Curved jet stream trajectory
            vec2 perp = vec2(-jetDir.y, jetDir.x);
            float curve = sin(jetProgress * 3.14159) * 0.08 * sin(aPhase * 4.0);
            
            pos.xy = emitter + jetDir * jetLen + perp * curve;
            pos.z = (sin(jetProgress * 6.28) * 0.05);
            
            coreDist = jetProgress;
        } else {
            // Ambient inner starry dust bounded around center
            float r = length(pos.xy);
            float angle = atan(pos.y, pos.x) + 0.15 * t * (1.0 / (r + 0.3));
            pos.x = cos(angle) * r;
            pos.y = sin(angle) * r;
            pos.xy += sin(vec2(t * 0.5, t * 0.7) + pos.yx * 2.0) * (0.02 + uMids * 0.03);
            coreDist = r;
        }
    } else {
        // Natural organic harmonic flow centered within bounded radius
        pos.xy += sin(vec2(t * 0.6 + pos.y * 1.5, t * 0.8 + pos.x * 1.5)) * (0.03 + uMids * 0.04);
        coreDist = length(pos.xy);
    }
    
    // Treble and transient spark vibration
    pos += aVelocity * (uTreble * 0.1 + uTransient * 0.18);

    // Strict Center Bounded Radius Check (Fade out smoothly to 0 before r = 0.95)
    float rCurrent = length(pos.xy);
    float maxRadius = 0.92;
    float centerEdgeFade = smoothstep(maxRadius, maxRadius * 0.55, rCurrent);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation: Core particles are sharper, dust particles are softer
    float sizeMultiplier = 1.0 + uTreble * 0.7 + uTransient * 1.3;
    if (aType == 2.0) sizeMultiplier *= 1.3; // Jets are luminous
    gl_PointSize = (aSize * uParticleSize * sizeMultiplier) * (280.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 36.0);
    
    // Luminous color calculation
    vec3 col = mix(uColorGlow, uColorAccent, sin(aPhase + uTime * 0.6) * 0.5 + 0.5);
    
    // Bright white core intensity for binary cores and jet origin
    float coreGlow = smoothstep(0.35, 0.02, coreDist);
    if (aType == 2.0) {
        coreGlow = smoothstep(0.4, 0.0, coreDist);
    }
    
    vCoreIntensity = coreGlow;
    vColor = col;
    vAlpha = (0.3 + uEnergy * 0.5 + uTransient * 0.3) * centerEdgeFade;
}
`;

export const particleFragmentShader = `
varying vec3 vColor;
varying float vAlpha;
varying float vCoreIntensity;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Smooth Gaussian point sprite
    float core = smoothstep(0.18, 0.0, dist);
    float halo = smoothstep(0.5, 0.0, dist);
    float alpha = (core * 0.6 + halo * 0.4) * vAlpha;
    
    // Blazing white hot core when concentrated or near binary attractors
    vec3 col = mix(vColor, vec3(1.0, 1.0, 1.0), vCoreIntensity * 0.75 + core * 0.4);
    
    gl_FragColor = vec4(col, alpha);
}
`;
