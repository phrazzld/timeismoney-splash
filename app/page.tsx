import type { Metadata } from 'next';
import { LandingTemplate } from '@/app/landing';
import type { HeroProps } from '@/components/organisms/Hero';
import { CTAButton } from '@/components/molecules/CTAButton';
import { mergePageMetadata, toNextMetadata } from '@/lib/seo';

// Generate comprehensive page metadata
const pageMetadata = mergePageMetadata({
  title: 'See What Your Purchases Really Cost',
  description:
    'Convert any price to work hours instantly. See the true cost of your spending with the Time is Money Chrome extension - discover what your purchases really cost in time.',
  canonical: '/',
});

// Convert to Next.js metadata format
export const metadata: Metadata = toNextMetadata(pageMetadata);

export default function Home(): React.ReactNode {
  const heroProps: HeroProps = {
    heading: 'See What Your Purchases Really Cost',
    subheading: 'Convert any price to work hours instantly - See the true cost of your spending',
    backgroundVariant: 'gradient',
    variant: 'centered',
    cta: <CTAButton />,
  };

  return <LandingTemplate heroProps={heroProps} />;
}
