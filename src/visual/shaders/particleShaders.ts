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
attribute float aType; 
// 0: ambient stardust cloud
// 1: primary Einstein orbital ring (cincin gravitasi)
// 2: crescent/teardrop caustic loop (lensa gravitasi)
// 3: dual polar jet beams (semburan jet)
// 4: hyperbolic caustic filaments (bentuk aneh / astroid cusp)

varying vec3 vColor;
varying float vAlpha;
varying float vCoreIntensity;

void main() {
    vec3 pos = position;
    float t = uTime * uParticleSpeed * 0.4 + aPhase;
    float coreDist = 1.0;
    
    // Binary attractor centers (compact center radius ~ 0.22)
    float orbitR = 0.20 + uBass * 0.06;
    float orbitAngle = uTime * 0.45 * (1.0 + uVortexStrength * 0.4);
    vec2 coreA = vec2(cos(orbitAngle), sin(orbitAngle)) * orbitR;
    vec2 coreB = -coreA;

    if (aType == 1.0) {
        // 1. PRIMARY EINSTEIN ORBITAL RING (Cincin Lingkaran Utama)
        float ringRadius = 0.38 + sin(aPhase * 2.0 + t * 0.5) * 0.02 + uBass * 0.06;
        float angle = aPhase + t * 0.6;
        // Slight elliptical eccentricity
        pos.x = cos(angle) * ringRadius * 1.08;
        pos.y = sin(angle) * ringRadius * 0.92;
        pos.z = sin(angle * 3.0 + t) * 0.025;
        
        // Minor stippled scatter along ring
        pos.xy += aVelocity.xy * 0.03;
        coreDist = abs(length(pos.xy) - ringRadius) * 4.0;
    } 
    else if (aType == 2.0) {
        // 2. CRESCENT / TEARDROP CAUSTIC LOOP (Loop Melingkar di sekitar Core A - sesuai gambar 1)
        float loopT = mod(aPhase + t * 0.8, 6.28318);
        // Cardioid / Teardrop parametric loop centered around coreA
        float rLoop = 0.14 * (1.0 - sin(loopT));
        vec2 localLoop = vec2(
            rLoop * cos(loopT) * 1.3,
            rLoop * sin(loopT) * 1.1
        );
        // Rotate loop along binary angle
        mat2 rotMat = mat2(cos(orbitAngle + 0.8), sin(orbitAngle + 0.8), -sin(orbitAngle + 0.8), cos(orbitAngle + 0.8));
        pos.xy = coreA + rotMat * localLoop;
        pos.z = sin(loopT * 2.0) * 0.02;
        
        coreDist = length(localLoop) * 3.5;
    }
    else if (aType == 3.0) {
        // 3. DUAL POLAR JETS (Semburan Jet Tajam Memanjang - sesuai gambar 1 & 2)
        float isCoreA = step(3.14159, aPhase);
        vec2 emitter = isCoreA > 0.5 ? coreA : coreB;
        vec2 jetDir = normalize(emitter);
        // Opposite diagonal orientation
        mat2 jetRot = mat2(cos(0.45), sin(0.45), -sin(0.45), cos(0.45));
        jetDir = jetRot * jetDir;
        
        float jetProgress = mod(t * 0.9 + aPhase * 0.6, 1.0);
        float jetLen = 0.02 + pow(jetProgress, 1.2) * (0.55 + uBass * 0.2);
        
        // Needle-like focus at root, slight filament spread at tip
        vec2 perp = vec2(-jetDir.y, jetDir.x);
        float spread = sin(jetProgress * 3.14159) * 0.025 * sin(aPhase * 6.0);
        
        pos.xy = emitter + jetDir * jetLen + perp * spread;
        pos.z = (sin(jetProgress * 6.28) * 0.03);
        
        coreDist = jetProgress; // Blazing hot at emitter root
    }
    else if (aType == 4.0) {
        // 4. HYPERBOLIC / ASTROID CAUSTIC CUSPS (Bentuk Aneh Lensa Gravitasi)
        float cuspT = mod(aPhase + t * 0.5, 6.28318);
        float cuspScale = 0.28 + uBass * 0.05;
        // Astroid / Hypocycloid curve: x = a*cos^3(t), y = a*sin^3(t)
        float cosT = cos(cuspT);
        float sinT = sin(cuspT);
        vec2 cuspShape = vec2(cosT * cosT * cosT, sinT * sinT * sinT) * cuspScale;
        
        mat2 cuspRot = mat2(cos(-orbitAngle * 0.6), sin(-orbitAngle * 0.6), -sin(-orbitAngle * 0.6), cos(-orbitAngle * 0.6));
        pos.xy = cuspRot * cuspShape + aVelocity.xy * 0.02;
        pos.z = sin(cuspT * 4.0) * 0.02;
        
        coreDist = length(pos.xy);
    }
    else {
        // 0. AMBIENT STARDUST (Debu kosmik halus terkonsentrasi di tengah)
        float r = length(pos.xy);
        float angle = atan(pos.y, pos.x) + 0.12 * t * (1.0 / (r + 0.25));
        pos.x = cos(angle) * r;
        pos.y = sin(angle) * r;
        pos.xy += sin(vec2(t * 0.4 + pos.y * 2.0, t * 0.5 + pos.x * 2.0)) * (0.015 + uMids * 0.02);
        coreDist = r * 1.5;
    }
    
    // Treble vibration & spark displacement
    pos += aVelocity * (uTreble * 0.08 + uTransient * 0.14);

    // Strict Compact Center Bound: Soft fadeout before r = 0.68
    float rCurrent = length(pos.xy);
    float maxRadius = 0.68;
    float centerFade = smoothstep(maxRadius, maxRadius * 0.50, rCurrent);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation: fine photographic stippled grain
    float sizeMultiplier = 1.0 + uTreble * 0.6 + uTransient * 1.2;
    if (aType == 3.0) sizeMultiplier *= 1.4; // Jets are brighter
    if (aType == 2.0) sizeMultiplier *= 1.2; // Crescent loop
    
    gl_PointSize = (aSize * uParticleSize * sizeMultiplier) * (260.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.8, 28.0);
    
    // Pure starlight silver-white palette
    vec3 col = mix(uColorGlow, uColorAccent, sin(aPhase + uTime * 0.4) * 0.3 + 0.7);
    
    // Blazing white hot intensity at jet emitters, loops and caustics
    float coreGlow = smoothstep(0.32, 0.01, coreDist);
    if (aType == 3.0) {
        coreGlow = smoothstep(0.35, 0.0, coreDist);
    }
    
    vCoreIntensity = coreGlow;
    vColor = col;
    vAlpha = (0.35 + uEnergy * 0.5 + uTransient * 0.35) * centerFade;
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
    float core = smoothstep(0.15, 0.0, dist);
    float halo = smoothstep(0.5, 0.0, dist);
    float alpha = (core * 0.7 + halo * 0.3) * vAlpha;
    
    // Pure white starlight core blending
    vec3 col = mix(vColor, vec3(1.0, 1.0, 1.0), clamp(vCoreIntensity * 0.85 + core * 0.5, 0.0, 1.0));
    
    gl_FragColor = vec4(col, alpha);
}
`;
