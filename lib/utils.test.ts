import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    // Basic functionality
    expect(cn('foo', 'bar')).toBe('foo bar');

    // Conditional classes
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');

    // Object syntax
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');

    // Array syntax
    expect(cn(['foo', 'bar'])).toBe('foo bar');

    // Complex mixed syntax
    expect(cn('foo', ['bar', { baz: true }], { qux: false })).toBe('foo bar baz');

    // Class merging with tailwind conflicts
    expect(cn('p-4 text-red-500', 'p-2 text-blue-500')).toBe('p-2 text-blue-500');

    // Should merge tailwind classes with proper specificity
    expect(cn('text-red-500 p-2', 'text-blue-500')).toBe('p-2 text-blue-500');

    // Should keep one value when there are multiple conflicting classes
    expect(cn('p-2 p-3 p-4')).toBe('p-4');
  });
});
