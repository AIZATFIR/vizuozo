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
uniform vec3 uColorGlow;
uniform vec3 uColorAccent;

attribute float aSize;
attribute float aPhase;
attribute vec3 aVelocity;
attribute float aType;

varying vec3 vColor;
varying float vAlpha;
varying float vCoreIntensity;

// Form 0: Photon Ring with Inner Filament (Image 3)
vec2 getFormRing(float aPhase, float t, out float coreDist) {
    float ringAngle = aPhase + t * 0.35;
    float rRing = 0.32 + sin(aPhase * 3.0) * 0.012 + uBass * 0.04;
    mat2 ringTilt = mat2(cos(0.48), sin(0.48), -sin(0.48), cos(0.48));
    vec2 pRing = ringTilt * vec2(cos(ringAngle) * rRing * 1.15, sin(ringAngle) * rRing * 0.88);
    
    // Inner squiggly tendril
    float tendrilT = (fract(aPhase * 2.2 + t * 0.25) - 0.5) * 0.42;
    vec2 pTendril = vec2(sin(tendrilT * 16.0) * 0.035 * (1.0 - abs(tendrilT) * 2.0), tendrilT);
    
    float isTendril = step(0.82, fract(aPhase * 3.7));
    vec2 pos = mix(pRing, pTendril, isTendril);
    coreDist = isTendril > 0.5 ? abs(tendrilT) * 2.0 : abs(length(pRing) - rRing) * 4.0;
    return pos;
}

// Form 1: Arched Bridge with Diagonal Antenna Needle (Images 1 & 2)
vec2 getFormArch(float aPhase, float t, out float coreDist) {
    vec2 pos = vec2(0.0);
    float part = fract(aPhase * 1.6);
    
    if (part < 0.38) {
        // Upward diagonal needle jet from (0.0, 0.05) towards top-right
        float needleT = part / 0.38;
        vec2 needleDir = normalize(vec2(0.55, 0.83));
        pos = vec2(0.0, 0.05) + needleDir * (needleT * 0.42 + uBass * 0.06);
        // Fine needle focus
        pos += vec2(-needleDir.y, needleDir.x) * sin(needleT * 22.0) * 0.006 * (1.0 - needleT);
        coreDist = needleT * 0.8;
    } else if (part < 0.68) {
        // Arched bridge crossbar & base
        float archT = (part - 0.38) / 0.30;
        float archX = (archT - 0.5) * 0.38;
        float archY = -0.06 - pow(abs(archX * 2.4), 1.5) * 0.10 + sin(archX * 10.0 + t) * 0.01;
        pos = vec2(archX, archY);
        coreDist = abs(archX) * 2.0;
    } else {
        // Lateral upright bridge pillars
        float legT = (part - 0.68) / 0.32;
        float isRight = step(0.5, fract(aPhase * 5.3));
        float legX = (isRight > 0.5 ? 0.16 : -0.16) + (legT - 0.5) * 0.04;
        float legY = mix(-0.18, 0.05, legT);
        pos = vec2(legX, legY);
        coreDist = abs(legY);
    }
    return pos;
}

// Form 2: Double-Lobed Hourglass / Apple Caustic with Singularity (Image 4)
vec2 getFormLobe(float aPhase, float t, out float coreDist) {
    float lobeT = aPhase + t * 0.3;
    float rLobe = 0.30 * (0.82 + 0.26 * cos(2.0 * lobeT) - 0.16 * sin(lobeT) + uBass * 0.05);
    vec2 pos = vec2(cos(lobeT) * rLobe * 1.08, sin(lobeT) * rLobe * 1.20);
    
    // Central waist pinch & bottom tail streamer
    if (fract(aPhase * 4.1) > 0.72) {
        float waistT = (fract(aPhase * 2.3 + t * 0.2) - 0.5) * 0.32;
        pos = vec2(sin(waistT * 12.0) * 0.025, waistT);
        coreDist = abs(waistT) * 2.0;
    } else {
        coreDist = abs(rLobe - 0.25) * 3.0;
    }
    return pos;
}

// Form 3: Dual Polar Jets (Cosmic Dipole from earlier ref)
vec2 getFormJets(float aPhase, float t, out float coreDist) {
    float isCoreA = step(3.14159, aPhase);
    vec2 emitter = isCoreA > 0.5 ? vec2(0.10, 0.12) : vec2(-0.10, -0.12);
    vec2 jetDir = normalize(emitter);
    mat2 jetRot = mat2(cos(0.42), sin(0.42), -sin(0.42), cos(0.42));
    jetDir = jetRot * jetDir;
    
    float jetProg = mod(t * 0.85 + aPhase * 0.55, 1.0);
    float jetLen = 0.02 + pow(jetProg, 1.2) * (0.48 + uBass * 0.15);
    vec2 perp = vec2(-jetDir.y, jetDir.x);
    float spread = sin(jetProg * 3.14159) * 0.02 * sin(aPhase * 5.0);
    
    vec2 pos = emitter + jetDir * jetLen + perp * spread;
    coreDist = jetProg;
    return pos;
}

// Form 4: Deep Semicolon ';' Caustic
vec2 getFormSemicolon(float aPhase, float t, out float coreDist) {
    float isDot = step(0.5, fract(aPhase * 2.0));
    vec2 pos = vec2(0.0);
    if (isDot > 0.5) {
        float dotAng = aPhase * 4.0 + t * 0.4;
        pos = vec2(cos(dotAng), sin(dotAng)) * 0.038 + vec2(0.0, 0.14);
        coreDist = 0.05;
    } else {
        float tailT = (fract(aPhase * 2.5 + t * 0.2) - 0.5) * 0.18 - 0.06;
        float tailX = -pow(max(0.0, -tailT * 2.0), 1.7) * 0.07;
        pos = vec2(tailX, tailT);
        coreDist = abs(tailT);
    }
    return pos;
}

// Form 5: Constellation Cat
vec2 getFormCat(float aPhase, float t, out float coreDist) {
    float catT = aPhase + t * 0.3;
    float r = 0.20 + sin(catT * 4.0) * 0.02;
    vec2 pos = vec2(cos(catT) * r, sin(catT) * r * 1.1) + vec2(0.0, -0.04);
    coreDist = 0.15;
    return pos;
}

vec2 evaluateForm(float formId, float aPhase, float t, out float coreDist) {
    if (formId < 0.5) return getFormRing(aPhase, t, coreDist);
    if (formId < 1.5) return getFormArch(aPhase, t, coreDist);
    if (formId < 2.5) return getFormLobe(aPhase, t, coreDist);
    if (formId < 3.5) return getFormJets(aPhase, t, coreDist);
    if (formId < 4.5) return getFormSemicolon(aPhase, t, coreDist);
    return getFormCat(aPhase, t, coreDist);
}

void main() {
    float t = uTime * uParticleSpeed * 0.45;
    
    float coreDistA = 1.0;
    float coreDistB = 1.0;
    
    vec2 posA = evaluateForm(uCausticFormSource, aPhase, t, coreDistA);
    vec2 posB = evaluateForm(uCausticFormTarget, aPhase, t, coreDistB);
    
    // Smooth morph interpolation between shapes
    vec2 pos2D = mix(posA, posB, uCausticMorph);
    float coreDist = mix(coreDistA, coreDistB, uCausticMorph);
    
    // Micro stippled scatter along caustic edges
    pos2D += aVelocity.xy * (0.012 + uTreble * 0.02 + uTransient * 0.03);
    
    vec3 pos = vec3(pos2D, sin(aPhase * 3.0 + t) * 0.015);
    
    // Strict Center Compact Bound (< 0.65 radius)
    float r = length(pos.xy);
    float maxRadius = 0.62;
    float centerFade = smoothstep(maxRadius, maxRadius * 0.55, r);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Micro stardust point size (photographic stippled grain)
    float sizeMultiplier = 1.0 + uTreble * 0.5 + uTransient * 1.0;
    gl_PointSize = (aSize * uParticleSize * sizeMultiplier) * (260.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.7, 24.0);
    
    // Pure silver-white starlight
    vec3 col = mix(uColorGlow, uColorAccent, sin(aPhase + uTime * 0.3) * 0.25 + 0.75);
    
    // Blazing white hot intensity at caustic ridges and needles
    float coreGlow = smoothstep(0.30, 0.005, coreDist);
    vCoreIntensity = coreGlow;
    vColor = col;
    vAlpha = (0.40 + uEnergy * 0.45 + uTransient * 0.35) * centerFade;
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
    
    // Fine stippled Gaussian point with blazing white center
    float core = smoothstep(0.14, 0.0, dist);
    float halo = smoothstep(0.5, 0.0, dist);
    float alpha = (core * 0.75 + halo * 0.25) * vAlpha;
    
    // Pure white starlight core blending
    vec3 col = mix(vColor, vec3(1.0, 1.0, 1.0), clamp(vCoreIntensity * 0.9 + core * 0.5, 0.0, 1.0));
    
    gl_FragColor = vec4(col, alpha);
}
`;
