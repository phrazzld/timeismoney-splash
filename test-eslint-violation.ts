// This file contains a deliberate ESLint violation for testing pre-commit hooks
export function testFunction(param: string): string {
  // Using 'as any' type assertion - this cannot be auto-fixed
  const result = param as unknown;
  return result.toString();
}
