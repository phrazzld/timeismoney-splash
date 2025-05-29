import spacingTokens, { semanticSpacing } from './spacing';

describe('Spacing Tokens', () => {
  it('should define all essential spacing values', () => {
    // Base scale values
    expect(spacingTokens).toHaveProperty('0');
    expect(spacingTokens).toHaveProperty('px');
    expect(spacingTokens['0.5']).toBe('2px');
    expect(spacingTokens).toHaveProperty('1');
    expect(spacingTokens).toHaveProperty('2');
    expect(spacingTokens).toHaveProperty('4');
    expect(spacingTokens).toHaveProperty('8');
    expect(spacingTokens).toHaveProperty('16');
    expect(spacingTokens).toHaveProperty('32');
    expect(spacingTokens).toHaveProperty('64');
  });

  it('should follow the 8px base unit pattern for core values', () => {
    expect(spacingTokens['2']).toBe('8px');
    expect(spacingTokens['4']).toBe('16px');
    expect(spacingTokens['8']).toBe('32px');
    expect(spacingTokens['16']).toBe('64px');
    expect(spacingTokens['32']).toBe('128px');
    expect(spacingTokens['64']).toBe('256px');
  });

  it('should include special values for fine-grained control', () => {
    expect(spacingTokens['px']).toBe('1px');
    expect(spacingTokens['0']).toBe('0px');
    expect(spacingTokens['0.5']).toBe('2px');
    expect(spacingTokens['1']).toBe('4px');
  });

  it('should provide spacing values as strings with "px" units', () => {
    for (const key in spacingTokens) {
      if (key !== '0' && key !== 'px') {
        expect(spacingTokens[key]).toMatch(/^\d+px$/);
      }
    }
  });
});

describe('Semantic Spacing', () => {
  it('should provide named aliases for common spacing values', () => {
    expect(semanticSpacing).toHaveProperty('none');
    expect(semanticSpacing).toHaveProperty('xs');
    expect(semanticSpacing).toHaveProperty('sm');
    expect(semanticSpacing).toHaveProperty('md');
    expect(semanticSpacing).toHaveProperty('lg');
    expect(semanticSpacing).toHaveProperty('xl');
  });

  it('should reference values from the spacing tokens', () => {
    expect(semanticSpacing.none).toBe(spacingTokens['0']);
    expect(semanticSpacing.xs).toBe(spacingTokens['1']);
    expect(semanticSpacing.sm).toBe(spacingTokens['2']);
    expect(semanticSpacing.md).toBe(spacingTokens['4']);
    expect(semanticSpacing.lg).toBe(spacingTokens['6']);
    expect(semanticSpacing.xl).toBe(spacingTokens['8']);
  });

  it('should include component-specific spacing values', () => {
    expect(semanticSpacing).toHaveProperty('buttonPadding');
    expect(semanticSpacing).toHaveProperty('inputPadding');
    expect(semanticSpacing).toHaveProperty('cardPadding');
    expect(semanticSpacing).toHaveProperty('sectionPadding');
    expect(semanticSpacing).toHaveProperty('pagePadding');
  });
});
