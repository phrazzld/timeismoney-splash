import { type Page, type Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly title: () => Promise<string>;
  readonly metaDescription: Locator;
  readonly canonicalLink: Locator;
  readonly openGraphTitle: Locator;
  readonly openGraphDescription: Locator;
  readonly openGraphUrl: Locator;
  readonly openGraphType: Locator;
  readonly heroSection: Locator;
  readonly heroCTA: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = (): Promise<string> => page.title();
    this.metaDescription = page.locator('meta[name="description"]');
    this.canonicalLink = page.locator('link[rel="canonical"]');
    this.openGraphTitle = page.locator('meta[property="og:title"]');
    this.openGraphDescription = page.locator('meta[property="og:description"]');
    this.openGraphUrl = page.locator('meta[property="og:url"]');
    this.openGraphType = page.locator('meta[property="og:type"]');
    this.heroSection = page.locator('section[aria-label="Hero section"]');
    this.heroCTA = page.locator('button:has-text("Get Chrome Extension")');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async getMetaDescriptionContent(): Promise<string | null> {
    return this.metaDescription.getAttribute('content');
  }

  async getCanonicalHref(): Promise<string | null> {
    return this.canonicalLink.getAttribute('href');
  }

  async getOpenGraphContent(
    property: 'og:title' | 'og:description' | 'og:url' | 'og:type',
  ): Promise<string | null> {
    return this.page.locator(`meta[property="${property}"]`).getAttribute('content');
  }

  /**
   * Get the Hero section element
   */
  async getHeroElement(): Promise<Locator> {
    return this.heroSection;
  }

  /**
   * Get the Hero CTA button element
   */
  async getHeroCTA(): Promise<Locator> {
    return this.heroCTA;
  }

  /**
   * Get the bounding box of the Hero section
   */
  async getHeroPosition(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return this.heroSection.boundingBox();
  }

  /**
   * Check if Hero section is visible above the fold (within viewport height)
   */
  async isHeroAboveFold(): Promise<boolean> {
    const boundingBox = await this.getHeroPosition();
    if (!boundingBox) return false;

    const viewportSize = this.page.viewportSize();
    if (!viewportSize) return false;

    // Hero is above fold if its top edge is visible within the viewport height
    return boundingBox.y >= 0 && boundingBox.y < viewportSize.height;
  }
}
