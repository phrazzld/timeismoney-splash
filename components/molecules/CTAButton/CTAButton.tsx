'use client';

import React from 'react';

/**
 * CTA Button for the Chrome Extension
 * Simple button that navigates to Chrome Web Store
 */
export const CTAButton: React.FC = () => {
  const handleClick = (): void => {
    // Navigate to Chrome Web Store for Time is Money extension
    window.open('https://chrome.google.com/webstore', '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary h-11 px-8 text-base"
      aria-label="Get Time is Money Chrome Extension - Opens in new tab"
      tabIndex={0}
    >
      Get Chrome Extension
    </button>
  );
};

export default CTAButton;
