/**
 * GLSL Signed Distance Field (SDF) functions for rendering a deep monumental semicolon ';'
 */
export const SemicolonGLSL = `
// Distance to a 2D circle
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// Distance to a tapered curved comma tail
float sdCommaTail(vec2 p, float r) {
    // Offset p relative to bottom dot
    vec2 cp = p;
    // Curved sweep downwards and to the left
    float sweep = cp.y * 0.5;
    cp.x += sweep * sweep * 1.8;
    
    // Tapering width as y decreases
    float width = r * max(0.0, 1.0 + cp.y * 2.5);
    return length(vec2(cp.x, max(0.0, -cp.y))) - width;
}

// Complete Semicolon Signed Distance Field
// uv centered around (0,0), scale ~ 1.0
float sdSemicolon(vec2 p, float scale) {
    vec2 q = p / scale;
    
    // Top dot centered at (0.0, 0.28)
    vec2 topPos = q - vec2(0.0, 0.28);
    float dTop = sdCircle(topPos, 0.13);
    
    // Bottom dot centered at (0.0, -0.15)
    vec2 botPos = q - vec2(0.0, -0.15);
    float dBotCircle = sdCircle(botPos, 0.13);
    
    // Comma tail extending from bottom dot
    vec2 tailPos = q - vec2(0.0, -0.15);
    float dTail = sdCommaTail(tailPos, 0.13);
    
    float dBottom = min(dBotCircle, dTail);
    float d = min(dTop, dBottom);
    
    return d * scale;
}
`;
