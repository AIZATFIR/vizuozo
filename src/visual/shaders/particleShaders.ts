export const particleVertexShader = `
uniform float uTime;
uniform float uBass;
uniform float uMids;
uniform float uTreble;
uniform float uTransient;
uniform float uEnergy;
uniform float uParticleSpeed;
uniform float uParticleSize;
uniform float uCausticFormSource;
uniform float uCausticFormTarget;
uniform float uCausticMorph;
uniform float uBoomMorph;
uniform vec3 uColorGlow;
uniform vec3 uColorAccent;

attribute float aSize;
attribute float aPhase;
attribute vec3 aVelocity;
attribute float aType; // 0..1 curve & dispersion parameter

varying vec3 vColor;
varying float vAlpha;

// -----------------------------------------------------------------------------
// Form 0: Ethereal Photon Ring & Filament (Gambar 3)
// -----------------------------------------------------------------------------
vec2 getFormRing(float p, float t, vec3 noise) {
    mat2 tilt = mat2(cos(0.68), sin(0.68), -sin(0.68), cos(0.68));
    vec2 pos = vec2(0.0);
    
    if (p < 0.75) {
        // Delicate thin photon ring
        float s = p / 0.75;
        float angle = s * 6.2831853 + t * 0.2;
        float rx = 0.28 + sin(s * 12.0) * 0.008 + uBass * 0.06;
        float ry = 0.21 + cos(s * 12.0) * 0.006 + uBass * 0.04;
        
        // Fine dispersion / pecyar scatter
        float scatter = noise.x * (0.008 + (1.0 - aType) * 0.035 + uTreble * 0.015);
        vec2 ringP = tilt * vec2(cos(angle) * (rx + scatter), sin(angle) * (ry + scatter));
        pos = ringP;
    } else {
        // Inner lightning tendril
        float s = (p - 0.75) / 0.25;
        float y = mix(0.12, -0.12, s);
        float zig = sin(s * 28.0 + uTime * 6.0) * (0.022 + uTreble * 0.02) * (1.0 - s * 0.4);
        zig += noise.y * (0.006 + uTreble * 0.01);
        pos = tilt * vec2(zig, y);
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 1: Cosmic Arch & 45° Antenna Jet (Gambar 1 & 2)
// -----------------------------------------------------------------------------
vec2 getFormArch(float p, float t, vec3 noise) {
    vec2 pos = vec2(0.0);
    
    if (p < 0.38) {
        // Sharp diagonal antenna needle shooting towards top-right (+45°)
        float s = p / 0.38;
        vec2 root = vec2(0.0, 0.04);
        vec2 dir = normalize(vec2(0.65, 0.76));
        float len = 0.38 + uBass * 0.18 + uTransient * 0.30;
        
        // Needle tip with delicate micro-filament spread
        float spread = pow(s, 1.5) * (0.015 + uTreble * 0.02) * noise.x;
        pos = root + dir * (s * len) + vec2(-dir.y, dir.x) * spread;
        // Bulb pinch node near tip
        float bulb = exp(-pow((s - 0.72) * 14.0, 2.0)) * 0.012 * noise.y;
        pos += vec2(-dir.y, dir.x) * bulb;
    } else if (p < 0.70) {
        // Arched cradle bottom ribs
        float s = (p - 0.38) / 0.32;
        float x = (s - 0.5) * (0.36 + uBass * 0.08);
        float y = -0.10 + pow(x * 2.5, 2.0) * 0.07 - 0.03 * cos(s * 3.14159);
        y += noise.y * (0.008 + (1.0 - aType) * 0.025);
        x += noise.x * (0.008 + (1.0 - aType) * 0.025);
        pos = vec2(x, y);
    } else {
        // Upright thin pillar filaments
        float s = (p - 0.70) / 0.30;
        float isLeft = step(0.5, fract(s * 2.0));
        float legX = (isLeft > 0.5 ? -0.15 : 0.15) * (1.0 + uBass * 0.12) + noise.x * 0.015;
        float legY = mix(-0.15, 0.06, fract(s * 4.0)) + noise.y * 0.015;
        pos = vec2(legX, legY);
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 2: Double-Lobe Cardioid / Hourglass Caustic (Gambar 4)
// -----------------------------------------------------------------------------
vec2 getFormLobe(float p, float t, vec3 noise) {
    vec2 pos = vec2(0.0);
    
    if (p < 0.52) {
        // Dual kidney lobes meeting at top singularity
        float s = p / 0.52;
        float angle = s * 6.2831853;
        float r = 0.25 * (0.85 + 0.26 * cos(2.0 * angle) - 0.18 * sin(angle) + uBass * 0.06);
        r += noise.x * (0.008 + (1.0 - aType) * 0.03);
        pos = vec2(cos(angle) * r * 1.05, sin(angle) * r * 1.22 + 0.02);
    } else if (p < 0.82) {
        // Dense glowing bottom crescent arc
        float s = (p - 0.52) / 0.30;
        float arcAngle = mix(-2.35, -0.79, s);
        float rCrescent = 0.23 + uBass * 0.05 + noise.y * 0.012;
        pos = vec2(cos(arcAngle) * rCrescent * 1.18, sin(arcAngle) * rCrescent * 0.95 - 0.02);
    } else {
        // Wispy vertical streamer tail
        float s = (p - 0.82) / 0.18;
        float tailY = mix(-0.18, -0.36 - uTransient * 0.15, s);
        float tailX = sin(s * 14.0 + uTime * 4.0) * (0.01 + uTreble * 0.015) + noise.x * 0.015;
        pos = vec2(tailX, tailY);
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 3: Dual Polar Relativistic Jets (Gambar Awal)
// -----------------------------------------------------------------------------
vec2 getFormJets(float p, float t, vec3 noise) {
    vec2 pos = vec2(0.0);
    
    if (p < 0.45) {
        // Bottom-Right diagonal jet beam (-35°)
        float s = p / 0.45;
        vec2 origin = vec2(0.07, -0.07);
        vec2 dir = normalize(vec2(0.82, -0.57));
        float len = 0.40 + uBass * 0.20 + uTransient * 0.30;
        float spread = pow(s, 1.3) * (0.015 + uTreble * 0.02) * noise.y;
        pos = origin + dir * (pow(s, 1.1) * len) + vec2(-dir.y, dir.x) * spread;
    } else if (p < 0.75) {
        // Top-Left Crescent Loop & Focal Needle
        float s = (p - 0.45) / 0.30;
        float loopAngle = s * 6.2831853;
        float rLoop = 0.11 * (1.0 - sin(loopAngle)) + noise.x * 0.01;
        vec2 loopCenter = vec2(-0.13, 0.11);
        mat2 loopRot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        pos = loopCenter + loopRot * vec2(cos(loopAngle) * rLoop * 1.25, sin(loopAngle) * rLoop);
    } else {
        // Ethereal outer stardust halo
        float s = (p - 0.75) / 0.25;
        float orbitAngle = s * 6.2831853 + t * 0.15;
        float rOrbit = 0.32 + uBass * 0.04 + noise.x * 0.04;
        pos = vec2(cos(orbitAngle) * rOrbit * 1.1, sin(orbitAngle) * rOrbit * 0.95);
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 4: Pure Abstract Astroid / Deltoid Caustic Cusp
// -----------------------------------------------------------------------------
vec2 getFormCusp(float p, float t, vec3 noise) {
    float ang = p * 6.2831853 + t * 0.2;
    float r = 0.24 * (0.8 + 0.25 * cos(3.0 * ang) + uBass * 0.06);
    r += noise.x * (0.01 + (1.0 - aType) * 0.035);
    vec2 pos = vec2(cos(ang) * r, sin(ang) * r);
    return pos;
}

// -----------------------------------------------------------------------------
// Form 5: Constellation Cat
// -----------------------------------------------------------------------------
vec2 getFormCat(float p, float t, vec3 noise) {
    float ang = p * 6.2831853;
    float r = 0.18 + sin(ang * 4.0) * 0.015 + uTransient * 0.02;
    r += noise.x * 0.015;
    vec2 pos = vec2(cos(ang) * r, sin(ang) * r * 1.1) + vec2(0.0, -0.04);
    return pos;
}

vec2 evaluateForm(float formId, float p, float t, vec3 noise) {
    if (formId < 0.5) return getFormRing(p, t, noise);
    if (formId < 1.5) return getFormArch(p, t, noise);
    if (formId < 2.5) return getFormLobe(p, t, noise);
    if (formId < 3.5) return getFormJets(p, t, noise);
    if (formId < 4.5) return getFormCusp(p, t, noise);
    return getFormCat(p, t, noise);
}

void main() {
    float t = uTime * uParticleSpeed * 0.35;
    
    // Evaluate exact geometric positions on curves with fine starlight dispersion
    vec2 posA = evaluateForm(uCausticFormSource, aPhase, t, aVelocity);
    vec2 posB = evaluateForm(uCausticFormTarget, aPhase, t, aVelocity);
    
    // Smooth morph interpolation
    vec2 pos2D = mix(posA, posB, uCausticMorph);
    
    // Dynamic Audio Boom Mutation: morphs dynamically on beat drop
    if (uBoomMorph > 0.001) {
        float boomTarget = mod(uCausticFormTarget + 1.0, 5.0);
        vec2 posBoom = evaluateForm(boomTarget, aPhase, t, aVelocity);
        pos2D = mix(pos2D, posBoom, uBoomMorph * 0.65);
    }
    
    // Subtle axial depth breathing
    float zDisp = aVelocity.z * (0.01 + uBass * 0.02 + uTransient * 0.04);
    vec3 pos = vec3(pos2D, zDisp);
    
    // Strict Center Compact Bound (< 0.60 radius)
    float r = length(pos.xy);
    float maxRadius = 0.60 + uTransient * 0.06;
    float centerFade = smoothstep(maxRadius, maxRadius * 0.55, r);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Single-pixel / ultra-fine micro-stardust grain (zero chunky blobs!)
    float sizeMultiplier = (0.7 + aType * 0.6) * (1.0 + uTreble * 0.3 + uTransient * 0.6);
    gl_PointSize = (aSize * uParticleSize * sizeMultiplier) * (180.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.7, 5.0); // Maximum 5px even on close-up!
    
    // Pure silver-white starlight
    vColor = mix(uColorGlow, uColorAccent, 0.9);
    
    // Low individual opacity so thousands of overlapping micro-points build up luminous caustics
    float baseAlpha = aType > 0.5 ? 0.35 : 0.18;
    vAlpha = (baseAlpha + uEnergy * 0.25 + uTransient * 0.4) * centerFade;
}
`;

export const particleFragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Sharp airy micro-stardust Gaussian point
    float alpha = exp(-dist * dist * 12.0) * vAlpha;
    
    gl_FragColor = vec4(vColor, alpha);
}
`;
