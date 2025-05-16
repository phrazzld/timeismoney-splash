// This file contains a deliberate ESLint violation for testing pre-commit hooks
export function testFunction(param: unknown): string {
  return param.toString();
}
