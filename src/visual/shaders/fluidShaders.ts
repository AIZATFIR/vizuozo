import { SemicolonGLSL } from './semicolonGlyph';

export const fluidVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

export const fluidFragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

// Audio reactive uniforms
uniform float uBass;
uniform float uMids;
uniform float uTreble;
uniform float uTransient;
uniform float uEnergy;

// Preset configuration uniforms
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;
uniform vec3 uColorAccent;
uniform vec3 uColorBg;
uniform vec3 uColorGlow;
uniform float uFluidScale;
uniform float uFluidSpeed;
uniform float uFluidViscosity;
uniform float uSemicolonVisibility;
uniform float uArchPresence;
uniform float uChromaticAberration;
uniform float uNoiseOctaves;

varying vec2 vUv;

${SemicolonGLSL}

// Simplex 2D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Fractal Brownian Motion with domain warping
float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
        if (float(i) >= uNoiseOctaves) break;
        total += snoise(p * freq) * amp;
        p = rot * p * 2.0 + vec2(100.0);
        amp *= 0.5;
        freq *= 1.95;
    }
    return total;
}

// Domain warped fluid density
float fluidPattern(vec2 p, out vec2 q, out vec2 r) {
    float t = uTime * uFluidSpeed * 0.2;
    
    float bassWarp = uBass * 0.45;
    float midsWarp = uMids * 0.35;
    
    q = vec2(
        fbm(p + vec2(0.0, 0.0) + t * 0.35 + bassWarp),
        fbm(p + vec2(5.2, 1.3) + t * 0.30 - midsWarp)
    );
    
    r = vec2(
        fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 0.4),
        fbm(p + 3.5 * q + vec2(8.3, 2.8) + t * 0.35)
    );
    
    return fbm(p + 3.5 * r + t * 0.45);
}

// Architectural arch caustics (for Jannah preset)
float archSilhouette(vec2 p) {
    if (uArchPresence <= 0.01) return 0.0;
    
    float repX = fract(p.x * 1.5 + 0.5) - 0.5;
    float archY = p.y - 0.15;
    
    float archCurve = 1.0 - pow(abs(repX * 2.0), 1.6);
    float archDist = abs(archY - archCurve * 0.75) - 0.035;
    
    float dome = length(vec2(repX * 1.8, max(0.0, archY - 0.45))) - 0.28;
    float archMask = smoothstep(0.1, 0.0, min(archDist, dome));
    
    float rays = smoothstep(0.06, 0.0, abs(repX) - 0.012) * smoothstep(0.7, -0.5, archY);
    
    return (archMask * 0.6 + rays * 0.4) * uArchPresence;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
    
    // Subtle mouse displacement
    vec2 mouseOffset = (uMouse - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
    float mouseDist = length(uv - mouseOffset);
    vec2 mouseDisp = normalize(uv - mouseOffset + 0.0001) * exp(-mouseDist * 4.5) * 0.06;
    uv += mouseDisp;
    
    // Transient ripple shockwave
    float rDist = length(uv);
    float shockwave = sin(rDist * 16.0 - uTime * 3.5) * uTransient * 0.035;
    uv += normalize(uv + 0.0001) * shockwave;

    // Fluid coordinates
    vec2 p = uv * uFluidScale;
    vec2 q, r;
    float f = fluidPattern(p, q, r);
    
    // Deep Dark Void Base
    vec3 col = uColorBg;
    
    // Smooth bioluminescent fluid filament density
    // Only light up where fluid streams form, leaving deep black voids in between
    float fluidDensity = smoothstep(-0.25, 0.65, f);
    float ribbonDensity = smoothstep(0.1, 0.8, length(q));
    float accentDensity = smoothstep(0.2, 0.9, length(r.x));
    
    // Layer 1: Warm glowing fluid streams
    col += uColorPrimary * fluidDensity * (0.45 + uBass * 0.35);
    
    // Layer 2: Translucent harmonic ribbons (driven by mids)
    col += uColorSecondary * ribbonDensity * (0.35 + uMids * 0.35);
    
    // Layer 3: Accent caustics and highlights (driven by treble)
    col += uColorAccent * accentDensity * (0.25 + uTreble * 0.3);
    
    // Soft bioluminescent glow (no harsh white glare)
    float softGlow = pow(clamp(fluidDensity * ribbonDensity * 1.5, 0.0, 1.0), 2.5);
    col += uColorGlow * softGlow * (0.35 + uEnergy * 0.25);
    
    // Architectural Arches (Jannah preset)
    float arch = archSilhouette(uv);
    if (arch > 0.001) {
        col += uColorGlow * arch * (0.35 + uBass * 0.25);
    }
    
    // Deep Monumental Semicolon ';' in the dark abyss
    if (uSemicolonVisibility > 0.01) {
        vec2 semiUv = uv + vec2(0.0, -0.05) + vec2(snoise(uv * 1.8 + uTime * 0.08)) * (0.015 + uBass * 0.025);
        float semiScale = 1.35;
        float dSemi = sdSemicolon(semiUv, semiScale);
        
        // Deep soft glowing contour
        float semiInner = smoothstep(0.015, -0.03, dSemi);
        float semiGlow = smoothstep(0.28, 0.0, dSemi) * (0.25 + uBass * 0.3 + uTransient * 0.2);
        
        vec3 semiCol = mix(uColorGlow, uColorAccent, 0.5);
        col += semiCol * (semiInner * 0.18 + semiGlow * 0.22) * uSemicolonVisibility;
    }
    
    // Atmospheric Vignette (fades gracefully to pitch black around edges)
    float vignette = smoothstep(1.5, 0.25, length(uv));
    col *= vignette;
    
    // Subtle chromatic aberration on active edges
    if (uChromaticAberration > 0.001) {
        float ca = uChromaticAberration * (0.003 + uTransient * 0.005);
        col.r *= 1.0 + ca * length(q);
        col.b *= 1.0 - ca * length(r);
    }

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
