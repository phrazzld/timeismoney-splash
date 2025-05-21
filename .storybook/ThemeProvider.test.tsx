import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    clear: (): void => {
      store = {};
    },
  };
})();

// Mock document.documentElement.classList
const classListMock = {
  remove: jest.fn(),
  add: jest.fn(),
};

describe('ThemeProvider', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(document.documentElement, 'classList', { value: classListMock });
  });

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies light theme by default', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(classListMock.remove).toHaveBeenCalledWith('light', 'dark');
    expect(localStorageMock.getItem('storybook-theme')).toBe('light');
  });

  it('applies dark theme when specified', () => {
    render(
      <ThemeProvider theme="dark">
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(classListMock.remove).toHaveBeenCalledWith('light', 'dark');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
    expect(localStorageMock.getItem('storybook-theme')).toBe('dark');
  });

  it('updates theme when prop changes', () => {
    const { rerender } = render(
      <ThemeProvider theme="light">
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(classListMock.remove).toHaveBeenCalledWith('light', 'dark');
    expect(localStorageMock.getItem('storybook-theme')).toBe('light');

    // Update theme prop
    rerender(
      <ThemeProvider theme="dark">
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(classListMock.remove).toHaveBeenCalledWith('light', 'dark');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
    expect(localStorageMock.getItem('storybook-theme')).toBe('dark');
  });
});
