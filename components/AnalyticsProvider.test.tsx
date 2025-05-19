import React from 'react';
import { render } from '@testing-library/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnalyticsProvider } from './AnalyticsProvider';
import * as analyticsModule from '@/lib/analytics';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock analytics module
jest.mock('@/lib/analytics', () => ({
  trackPageview: jest.fn(),
}));

describe('AnalyticsProvider', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
  const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
  const mockTrackPageview = analyticsModule.trackPageview as jest.MockedFunction<
    typeof analyticsModule.trackPageview
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', () => {
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(null);

    const { getByText } = render(
      <AnalyticsProvider>
        <div>Test Child</div>
      </AnalyticsProvider>,
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('should track pageview on mount', () => {
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(null);

    render(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    expect(mockTrackPageview).toHaveBeenCalledTimes(1);
    expect(mockTrackPageview).toHaveBeenCalledWith('/');
  });

  it('should track pageview with search params', () => {
    mockUsePathname.mockReturnValue('/search');
    const searchParams = new URLSearchParams('q=test');
    mockUseSearchParams.mockReturnValue(searchParams);

    render(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    expect(mockTrackPageview).toHaveBeenCalledWith('/search?q=test');
  });

  it('should track pageview when pathname changes', () => {
    const { rerender } = render(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    // Initial render
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(null);
    expect(mockTrackPageview).toHaveBeenCalledTimes(1);

    // Change pathname
    mockUsePathname.mockReturnValue('/about');
    rerender(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    expect(mockTrackPageview).toHaveBeenCalledTimes(2);
    expect(mockTrackPageview).toHaveBeenLastCalledWith('/about');
  });

  it('should track pageview when search params change', () => {
    const { rerender } = render(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    // Initial render
    mockUsePathname.mockReturnValue('/search');
    const searchParams1 = new URLSearchParams('q=test1');
    mockUseSearchParams.mockReturnValue(searchParams1);
    expect(mockTrackPageview).toHaveBeenCalledTimes(1);

    // Change search params
    const searchParams2 = new URLSearchParams('q=test2');
    mockUseSearchParams.mockReturnValue(searchParams2);
    rerender(
      <AnalyticsProvider>
        <div>Test</div>
      </AnalyticsProvider>,
    );

    expect(mockTrackPageview).toHaveBeenCalledTimes(2);
    expect(mockTrackPageview).toHaveBeenLastCalledWith('/search?q=test2');
  });
});
