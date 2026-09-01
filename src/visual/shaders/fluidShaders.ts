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

    // Fluid coordinates (compact scale)
    vec2 p = uv * (uFluidScale * 1.6);
    // Pure Pitch Black Void (#000000)
    vec3 col = vec3(0.0);
    
    // Deep Monumental Semicolon ';' in the dark abyss (subtle starlight contour when visible)
    if (uSemicolonVisibility > 0.01) {
        vec2 semiUv = uv + vec2(0.0, -0.04);
        float semiScale = 1.05;
        float dSemi = sdSemicolon(semiUv, semiScale);
        
        float semiInner = smoothstep(0.008, -0.015, dSemi);
        float semiGlow = smoothstep(0.12, 0.0, dSemi) * (0.12 + uBass * 0.15 + uTransient * 0.15);
        
        vec3 semiCol = mix(uColorGlow, uColorAccent, 0.8);
        col += semiCol * (semiInner * 0.10 + semiGlow * 0.14) * uSemicolonVisibility;
    }
    
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
