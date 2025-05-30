import type { Metadata } from 'next';
import { LandingTemplate } from '@/app/landing';
import type { HeroProps } from '@/components/organisms/Hero';
import { Button } from '@/components/atoms/Button';

export const metadata: Metadata = {
  title: 'Convert Prices to Work Hours',
  description:
    'Transform online prices into hours of work with the Time is Money Chrome extension. See the true cost of purchases in the time it takes to earn them.',
  alternates: {
    canonical: '/',
  },
};

export default function Home(): React.ReactNode {
  const heroProps: HeroProps = {
    heading: 'Convert Prices to Work Hours',
    subheading:
      'Transform online prices into hours of work with the Time is Money Chrome extension. See the true cost of purchases in the time it takes to earn them.',
    backgroundVariant: 'gradient',
    variant: 'centered',
    cta: (
      <Button variant="primary" size="lg">
        Get Chrome Extension
      </Button>
    ),
  };

  return <LandingTemplate heroProps={heroProps} />;
}
