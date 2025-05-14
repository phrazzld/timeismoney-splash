// This file deliberately contains Prettier formatting violations
// to test if the pre-commit hook auto-formats it

// Uses badly formatted variables to ensure they pass ESLint checks
function testPrettierFormatting(): void {
  const badlyFormattedVariable = 'This string uses double quotes instead of single quotes';
  console.log(badlyFormattedVariable);

  const result = badlyIndentedFunction('test', 123);
  console.log(result);

  // Use the type with a variable
  const myObject: BadlyFormattedType = {
    prop1: 'test',
    prop2: 42,
    prop3: true,
  };
  console.log(myObject);

  // Long line that exceeds printWidth (should be 100 characters according to .prettierrc.js)
  const veryLongLine =
    'This is a very long line that should definitely exceed the printWidth setting in the Prettier configuration and therefore be wrapped by Prettier during formatting';
  console.log(veryLongLine);

  console.log(TestObject);
}

function badlyIndentedFunction(param1: string, param2: number) {
  const someValue = param1 + String(param2);
  return someValue;
}

type BadlyFormattedType = {
  prop1: string;
  prop2: number;
  prop3: boolean;
};

export const TestObject = { prop1: 'value1', prop2: 'value2', prop3: 'value3' };

// Execute the function to use all variables
testPrettierFormatting();
