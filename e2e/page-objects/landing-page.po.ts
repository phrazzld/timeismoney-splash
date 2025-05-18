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

  constructor(page: Page) {
    this.page = page;

    this.title = (): Promise<string> => page.title();
    this.metaDescription = page.locator('meta[name="description"]');
    this.canonicalLink = page.locator('link[rel="canonical"]');
    this.openGraphTitle = page.locator('meta[property="og:title"]');
    this.openGraphDescription = page.locator('meta[property="og:description"]');
    this.openGraphUrl = page.locator('meta[property="og:url"]');
    this.openGraphType = page.locator('meta[property="og:type"]');
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
}
