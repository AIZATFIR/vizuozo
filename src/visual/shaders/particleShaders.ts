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
attribute float aType; // 0..1 parametric curve parameter

varying vec3 vColor;
varying float vAlpha;
varying float vCoreIntensity;

// -----------------------------------------------------------------------------
// Form 0: Tilted Glowing Ring with Inner Lightning Tendril (Image 3)
// -----------------------------------------------------------------------------
vec2 getFormRing(float p, float t, out float coreDist) {
    vec2 pos = vec2(0.0);
    mat2 tilt = mat2(cos(0.65), sin(0.65), -sin(0.65), cos(0.65));
    
    if (p < 0.78) {
        // Main thick luminous ring (s in [0, 1])
        float s = p / 0.78;
        float angle = s * 6.2831853 + t * 0.15;
        float rx = 0.28 + uBass * 0.08 + uTransient * 0.12;
        float ry = 0.21 + uBass * 0.06 + uTransient * 0.09;
        vec2 ringP = tilt * vec2(cos(angle) * rx, sin(angle) * ry);
        pos = ringP;
        coreDist = 0.05; // Bright core
    } else {
        // Inner lightning tendril filament inside dark hole
        float s = (p - 0.78) / 0.22;
        float y = mix(0.12, -0.12, s);
        float zig = sin(s * 24.0 + uTime * 6.0) * (0.025 + uTreble * 0.03) * (1.0 - s * 0.5);
        vec2 tendrilP = tilt * vec2(zig, y);
        pos = tendrilP;
        coreDist = 0.15;
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 1: Arched Book / Bridge Cradle with 45° Antenna Needle (Images 1 & 2)
// -----------------------------------------------------------------------------
vec2 getFormArch(float p, float t, out float coreDist) {
    vec2 pos = vec2(0.0);
    
    if (p < 0.35) {
        // 1. Sharp 45° Diagonal Antenna Needle shooting towards upper-right
        float s = p / 0.35;
        vec2 root = vec2(0.0, 0.04);
        vec2 dir = normalize(vec2(0.65, 0.76));
        float len = 0.38 + uBass * 0.20 + uTransient * 0.35;
        pos = root + dir * (s * len);
        // Antenna focal bulb node near tip
        float bulb = exp(-pow((s - 0.75) * 12.0, 2.0)) * 0.015;
        pos += vec2(-dir.y, dir.x) * (sin(s * 30.0 - uTime * 6.0) * 0.003 + bulb);
        coreDist = (1.0 - s) * 0.2;
    } else if (p < 0.65) {
        // 2. Arched Cradle Bottom Ribs (Connecting the 4 base vertices)
        float s = (p - 0.35) / 0.30;
        float x = (s - 0.5) * (0.38 + uBass * 0.1);
        // Parabolic / hyperbolic arched saddle
        float y = -0.12 + pow(x * 2.5, 2.0) * 0.08 - 0.04 * cos(s * 3.14159);
        pos = vec2(x, y);
        coreDist = 0.08;
    } else {
        // 3. Upright Pillars & Roof Crossbars
        float s = (p - 0.65) / 0.35;
        float isLeft = step(0.5, fract(s * 2.0));
        float legX = (isLeft > 0.5 ? -0.16 : 0.16) * (1.0 + uBass * 0.15);
        float legY = mix(-0.16, 0.06, fract(s * 4.0));
        pos = vec2(legX, legY);
        coreDist = 0.1;
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 2: Double-Lobe Hourglass / Cardioid Caustic with Singularity (Image 4)
// -----------------------------------------------------------------------------
vec2 getFormLobe(float p, float t, out float coreDist) {
    vec2 pos = vec2(0.0);
    
    if (p < 0.50) {
        // 1. Two Kidney Lobes meeting at top singularity
        float s = p / 0.50;
        float angle = s * 6.2831853;
        float r = 0.26 * (0.85 + 0.28 * cos(2.0 * angle) - 0.20 * sin(angle) + uBass * 0.08);
        pos = vec2(cos(angle) * r * 1.05, sin(angle) * r * 1.25 + 0.02);
        coreDist = 0.08;
    } else if (p < 0.82) {
        // 2. Dense Blazing White Bottom Crescent Basin
        float s = (p - 0.50) / 0.32;
        float arcAngle = mix(-2.4, -0.74, s);
        float rCrescent = 0.24 + uBass * 0.06;
        pos = vec2(cos(arcAngle) * rCrescent * 1.2, sin(arcAngle) * rCrescent * 0.95 - 0.02);
        coreDist = 0.02; // Super bright bottom crescent
    } else {
        // 3. Wispy Vertical Streamer Tail
        float s = (p - 0.82) / 0.18;
        float tailY = mix(-0.20, -0.38 - uTransient * 0.15, s);
        float tailX = sin(s * 12.0 + uTime * 4.0) * (0.01 + uTreble * 0.015);
        pos = vec2(tailX, tailY);
        coreDist = 0.25;
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 3: Dual Polar Jets & Dipole (Image 1 & 2 of 1st set)
// -----------------------------------------------------------------------------
vec2 getFormJets(float p, float t, out float coreDist) {
    vec2 pos = vec2(0.0);
    
    if (p < 0.45) {
        // Bottom-Right Jet Needle (shooting down-right at -35°)
        float s = p / 0.45;
        vec2 origin = vec2(0.08, -0.08);
        vec2 dir = normalize(vec2(0.82, -0.57));
        float len = 0.42 + uBass * 0.25 + uTransient * 0.35;
        pos = origin + dir * (pow(s, 1.1) * len);
        // Needle tip sharpness
        float width = sin(s * 3.14159) * (0.012 + uTreble * 0.015);
        pos += vec2(-dir.y, dir.x) * (aVelocity.x * width);
        coreDist = (1.0 - s) * 0.1;
    } else if (p < 0.75) {
        // Top-Left Crescent Loop & Focal Needle
        float s = (p - 0.45) / 0.30;
        float loopAngle = s * 6.2831853;
        float rLoop = 0.12 * (1.0 - sin(loopAngle));
        vec2 loopCenter = vec2(-0.14, 0.12);
        mat2 loopRot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        pos = loopCenter + loopRot * vec2(cos(loopAngle) * rLoop * 1.3, sin(loopAngle) * rLoop);
        coreDist = 0.08;
    } else {
        // Orbital Dust Filament Enclosing System
        float s = (p - 0.75) / 0.25;
        float orbitAngle = s * 6.2831853 + t * 0.15;
        float rOrbit = 0.34 + uBass * 0.05;
        pos = vec2(cos(orbitAngle) * rOrbit * 1.1, sin(orbitAngle) * rOrbit * 0.95);
        coreDist = 0.2;
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 4: Deep Semicolon ';' Caustic
// -----------------------------------------------------------------------------
vec2 getFormSemicolon(float p, float t, out float coreDist) {
    vec2 pos = vec2(0.0);
    if (p < 0.40) {
        float s = p / 0.40;
        float ang = s * 6.2831853;
        pos = vec2(cos(ang), sin(ang)) * 0.038 + vec2(0.0, 0.12 + uTransient * 0.04);
        coreDist = 0.05;
    } else {
        float s = (p - 0.40) / 0.60;
        float y = mix(0.04, -0.16, s);
        float x = -pow(max(0.0, -y * 2.2), 1.8) * 0.08;
        pos = vec2(x, y);
        coreDist = 0.08;
    }
    return pos;
}

// -----------------------------------------------------------------------------
// Form 5: Constellation Cat
// -----------------------------------------------------------------------------
vec2 getFormCat(float p, float t, out float coreDist) {
    float ang = p * 6.2831853;
    float r = 0.20 + sin(ang * 4.0) * 0.02 + uTransient * 0.03;
    vec2 pos = vec2(cos(ang) * r, sin(ang) * r * 1.1) + vec2(0.0, -0.04);
    coreDist = 0.15;
    return pos;
}

vec2 evaluateForm(float formId, float p, float t, out float coreDist) {
    if (formId < 0.5) return getFormRing(p, t, coreDist);
    if (formId < 1.5) return getFormArch(p, t, coreDist);
    if (formId < 2.5) return getFormLobe(p, t, coreDist);
    if (formId < 3.5) return getFormJets(p, t, coreDist);
    if (formId < 4.5) return getFormSemicolon(p, t, coreDist);
    return getFormCat(p, t, coreDist);
}

void main() {
    float t = uTime * uParticleSpeed * 0.35;
    
    float coreDistA = 1.0;
    float coreDistB = 1.0;
    float coreDistBoom = 1.0;
    
    // Evaluate exact geometric positions on curves
    vec2 posA = evaluateForm(uCausticFormSource, aPhase, t, coreDistA);
    vec2 posB = evaluateForm(uCausticFormTarget, aPhase, t, coreDistB);
    
    // Smooth morph interpolation
    vec2 pos2D = mix(posA, posB, uCausticMorph);
    float coreDist = mix(coreDistA, coreDistB, uCausticMorph);
    
    // Dynamic Audio Boom Mutation: morphs dynamically on beat drop
    if (uBoomMorph > 0.001) {
        float boomTarget = mod(uCausticFormTarget + 1.0, 5.0);
        vec2 posBoom = evaluateForm(boomTarget, aPhase, t, coreDistBoom);
        pos2D = mix(pos2D, posBoom, uBoomMorph * 0.65);
        coreDist = mix(coreDist, coreDistBoom, uBoomMorph * 0.65);
    }
    
    // Exact photographic caustic line thickness:
    // aType determines whether particle is on solid beam core (aType < 0.8) or fine grain dust halo (aType >= 0.8)
    float isBeamCore = step(aType, 0.82);
    float scatterScale = isBeamCore > 0.5 ? (0.003 + uTreble * 0.005) : (0.022 + uTreble * 0.015);
    pos2D += aVelocity.xy * scatterScale;
    
    // Axial depth displacement with subtle breathing
    float zDisp = aVelocity.z * (0.01 + uBass * 0.03 + uTransient * 0.05);
    vec3 pos = vec3(pos2D, zDisp);
    
    // Strict Center Compact Bound (< 0.62 radius)
    float r = length(pos.xy);
    float maxRadius = 0.62 + uTransient * 0.08;
    float centerFade = smoothstep(maxRadius, maxRadius * 0.55, r);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Point size for solid dense light lines
    float sizeBase = isBeamCore > 0.5 ? 1.6 : 1.0;
    float sizeMultiplier = sizeBase + uTreble * 0.4 + uTransient * 1.6 + uBass * 0.6;
    gl_PointSize = (aSize * uParticleSize * sizeMultiplier) * (260.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.8, 30.0);
    
    // Pure silver-white starlight
    vec3 col = mix(uColorGlow, uColorAccent, 0.85);
    
    // Additive glow intensity
    float coreGlow = smoothstep(0.30, 0.005, coreDist);
    vCoreIntensity = coreGlow + (isBeamCore > 0.5 ? 0.4 : 0.0) + uTransient * 0.8;
    vColor = col;
    vAlpha = (0.50 + uEnergy * 0.4 + uTransient * 0.5) * centerFade;
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
    
    // Fine stippled Gaussian point with intense blazing white center
    float core = smoothstep(0.12, 0.0, dist);
    float halo = smoothstep(0.5, 0.0, dist);
    float alpha = (core * 0.8 + halo * 0.2) * vAlpha;
    
    // Pure white starlight core blending
    vec3 col = mix(vColor, vec3(1.0, 1.0, 1.0), clamp(vCoreIntensity * 0.95 + core * 0.6, 0.0, 1.0));
    
    gl_FragColor = vec4(col, alpha);
}
`;
