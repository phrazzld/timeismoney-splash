/**
 * Core event types for analytics tracking
 * Following Google Analytics 4 recommended event naming
 */
export type CoreEvent =
  | 'click'
  | 'conversion'
  | 'page_view'
  | 'sign_up'
  | 'purchase'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'view_item'
  | 'search'
  | 'select_content'
  // Custom events for our site
  | 'extension_install_click'
  | 'cta_click'
  | 'feature_demo_used'
  | 'faq_expanded'
  | 'contact_form_submit';

/**
 * Properties that can be attached to analytics events
 * Following GA4 parameter guidelines
 */
export interface EventProps {
  [key: string]: string | number | boolean | undefined | unknown[];
  // Common GA4 parameters
  value?: number;
  currency?: string;
  items?: unknown[];
  content_type?: string;
  content_id?: string;
  // Custom parameters
  location?: string;
  variant?: string;
  source?: string;
  question_id?: string;
  event_category?: string;
  event_label?: string;
}

/**
 * Global gtag function interface
 */
export interface GtagFunction {
  (_command: 'config', _targetId: string, _config?: Record<string, unknown>): void;
  (_command: 'event', _eventName: string, _parameters?: EventProps): void;
  (_command: 'js', _date: Date): void;
  (_command: string, ..._args: unknown[]): void;
}

declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer?: unknown[];
  }
}
