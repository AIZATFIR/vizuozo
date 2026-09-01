import { describe, it, expect } from 'vitest';
import { PRESETS } from '../src/visual/presets';
import { VisualPresetId } from '../src/types';

describe('Visual Presets Configuration', () => {
  const presetIds: VisualPresetId[] = ['fluid', 'dream', 'jannah', 'rave', 'cat', 'void'];

  it('should contain all 6 required visual presets', () => {
    presetIds.forEach((id) => {
      expect(PRESETS[id]).toBeDefined();
      expect(PRESETS[id].id).toBe(id);
      expect(PRESETS[id].name).toBeTruthy();
    });
  });

  it('should have valid normalized color palettes for each preset', () => {
    presetIds.forEach((id) => {
      const palette = PRESETS[id].palette;
      ['primary', 'secondary', 'accent', 'background', 'glow'].forEach((key) => {
        const rgb = palette[key as keyof typeof palette];
        expect(rgb).toHaveLength(3);
        rgb.forEach((ch) => {
          expect(ch).toBeGreaterThanOrEqual(0);
          expect(ch).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  it('should have custom parameters for Jannah, Cat, and Void', () => {
    expect(PRESETS.jannah.archPresence).toBe(1.0);
    expect(PRESETS.cat.catPresence).toBe(1.0);
    expect(PRESETS.void.vortexStrength).toBe(1.0);
  });
});
