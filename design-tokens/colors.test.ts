import { brandColors, hexColors } from './colors';
import type { BrandColors } from './types';

describe('Brand Colors', () => {
  it('should define all required color categories', () => {
    // Test that all required color categories are defined
    expect(brandColors).toHaveProperty('primary');
    expect(brandColors).toHaveProperty('secondary');
    expect(brandColors).toHaveProperty('accent');
    expect(brandColors).toHaveProperty('neutral');
    expect(brandColors).toHaveProperty('success');
    expect(brandColors).toHaveProperty('warning');
    expect(brandColors).toHaveProperty('error');
    expect(brandColors).toHaveProperty('background');
  });

  it('should define primary colors with all variants', () => {
    // Test primary color variants
    expect(brandColors.primary).toHaveProperty('DEFAULT');
    expect(brandColors.primary).toHaveProperty('hover');
    expect(brandColors.primary).toHaveProperty('light');
    expect(brandColors.primary).toHaveProperty('dark');

    // Check primary green value
    expect(brandColors.primary.DEFAULT).toBe('oklch(0.7 0.2 145)');
  });

  it('should define a complete neutral scale (50-900)', () => {
    // Test neutral scale completeness
    const neutralScaleKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    neutralScaleKeys.forEach((key) => {
      expect(brandColors.neutral).toHaveProperty(key);
    });
  });

  it('should provide hex color values for reference', () => {
    // Test hex color values
    expect(hexColors).toHaveProperty('primary');
    expect(hexColors.primary.DEFAULT).toBe('#5CB85C');
  });

  it('should use OKLCH color format for all colors', () => {
    // Test that primary colors use OKLCH format
    expect(brandColors.primary.DEFAULT).toMatch(/^oklch\(\s*[\d.]+ [\d.]+ [\d.]+\s*\)$/);
    expect(brandColors.secondary.DEFAULT).toMatch(/^oklch\(\s*[\d.]+ [\d.]+ [\d.]+\s*\)$/);
    expect(brandColors.accent.DEFAULT).toMatch(/^oklch\(\s*[\d.]+ [\d.]+ [\d.]+\s*\)$/);
  });

  it('should conform to the BrandColors interface', () => {
    // This test is type-checking only - passes if it compiles
    const _test: BrandColors = brandColors;
    expect(true).toBe(true);
  });
});
