import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  typography,
  typographyPresets,
} from './typography';
import type {
  FontFamilies,
  FontSizes,
  FontWeights,
  LineHeights,
  LetterSpacings,
  TypographyTokens,
  TypographyPresets,
} from './types';

describe('Typography Tokens', () => {
  describe('Font Families', () => {
    it('should define sans and mono font families', () => {
      expect(fontFamilies).toHaveProperty('sans');
      expect(fontFamilies).toHaveProperty('mono');
      expect(fontFamilies.sans).toContain('Geist Sans');
      expect(fontFamilies.mono).toContain('Geist Mono');
    });

    it('should include fallback fonts', () => {
      expect(fontFamilies.sans).toContain('system-ui');
      expect(fontFamilies.mono).toContain('ui-monospace');
    });

    it('should satisfy FontFamilies interface', () => {
      const typedFontFamilies: FontFamilies = fontFamilies;
      expect(typedFontFamilies).toBe(fontFamilies);
    });
  });

  describe('Font Sizes', () => {
    it('should define a range of font sizes from xs to 9xl', () => {
      const expectedSizes = [
        'xs',
        'sm',
        'base',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        '7xl',
        '8xl',
        '9xl',
      ];
      expectedSizes.forEach((size) => {
        expect(fontSizes).toHaveProperty(size);
      });
    });

    it('should express font sizes in rem units', () => {
      Object.values(fontSizes).forEach((size) => {
        expect(size).toMatch(/^\d+(\.\d+)?rem$/);
      });
    });

    it('should satisfy FontSizes interface', () => {
      const typedFontSizes: FontSizes = fontSizes;
      expect(typedFontSizes).toBe(fontSizes);
    });
  });

  describe('Font Weights', () => {
    it('should define common font weights', () => {
      const expectedWeights = ['light', 'normal', 'medium', 'semibold', 'bold'];
      expectedWeights.forEach((weight) => {
        expect(fontWeights).toHaveProperty(weight);
      });
    });

    it('should use numeric values for weights', () => {
      Object.values(fontWeights).forEach((weight) => {
        expect(typeof weight).toBe('number');
        expect(weight).toBeGreaterThanOrEqual(100);
        expect(weight).toBeLessThanOrEqual(900);
      });
    });

    it('should satisfy FontWeights interface', () => {
      const typedFontWeights: FontWeights = fontWeights;
      expect(typedFontWeights).toBe(fontWeights);
    });
  });

  describe('Line Heights', () => {
    it('should define a range of line heights', () => {
      const expectedLineHeights = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'];
      expectedLineHeights.forEach((height) => {
        expect(lineHeights).toHaveProperty(height);
      });
    });

    it('should satisfy LineHeights interface', () => {
      const typedLineHeights: LineHeights = lineHeights;
      expect(typedLineHeights).toBe(lineHeights);
    });
  });

  describe('Letter Spacings', () => {
    it('should define a range of letter spacings', () => {
      const expectedSpacings = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'];
      expectedSpacings.forEach((spacing) => {
        expect(letterSpacings).toHaveProperty(spacing);
      });
    });

    it('should express letter spacings in em units', () => {
      Object.values(letterSpacings).forEach((spacing) => {
        expect(spacing).toMatch(/^-?\d+(\.\d+)?em$/);
      });
    });

    it('should satisfy LetterSpacings interface', () => {
      const typedLetterSpacings: LetterSpacings = letterSpacings;
      expect(typedLetterSpacings).toBe(letterSpacings);
    });
  });

  describe('Combined Typography Object', () => {
    it('should combine all typography token categories', () => {
      expect(typography).toHaveProperty('fontFamilies');
      expect(typography).toHaveProperty('fontSizes');
      expect(typography).toHaveProperty('fontWeights');
      expect(typography).toHaveProperty('lineHeights');
      expect(typography).toHaveProperty('letterSpacings');
    });

    it('should satisfy TypographyTokens interface', () => {
      const typedTypography: TypographyTokens = typography;
      expect(typedTypography).toBe(typography);
    });
  });

  describe('Typography Presets', () => {
    it('should define heading variants from h1 to h6', () => {
      const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      headings.forEach((heading) => {
        expect(typographyPresets).toHaveProperty(heading);
      });
    });

    it('should define body text variants', () => {
      const bodyVariants = ['bodyLarge', 'body', 'bodySmall'];
      bodyVariants.forEach((variant) => {
        expect(typographyPresets).toHaveProperty(variant);
      });
    });

    it('should define utility text variants', () => {
      const utilityVariants = ['caption', 'overline', 'label'];
      utilityVariants.forEach((variant) => {
        expect(typographyPresets).toHaveProperty(variant);
      });
    });

    it('should define code variants', () => {
      const codeVariants = ['code', 'codeBlock'];
      codeVariants.forEach((variant) => {
        expect(typographyPresets).toHaveProperty(variant);
      });
    });

    it('should have all required properties in each preset', () => {
      Object.values(typographyPresets).forEach((preset) => {
        expect(preset).toHaveProperty('fontSize');
        expect(preset).toHaveProperty('fontWeight');
        expect(preset).toHaveProperty('lineHeight');
        expect(preset).toHaveProperty('letterSpacing');
        expect(preset).toHaveProperty('fontFamily');
      });
    });

    it('should satisfy TypographyPresets interface', () => {
      const typedPresets: TypographyPresets = typographyPresets;
      expect(typedPresets).toBe(typographyPresets);
    });
  });
});
