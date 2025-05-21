import type { Meta, StoryObj } from '@storybook/react';
import { brandColors, hexColors } from '../../design-tokens/colors';

const meta: Meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    controls: { hideNoControlsWarning: true },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface ColorSwatchProps {
  name: string;
  oklchValue: string;
  hexValue?: string;
}

const ColorSwatch = ({ name, oklchValue, hexValue }: ColorSwatchProps) => (
  <div className="border border-neutral-200 rounded-lg p-4 min-w-48">
    <div
      className="w-full h-24 rounded-md mb-3 border border-neutral-100"
      style={{ backgroundColor: oklchValue }}
      title={`${name}: ${oklchValue}${hexValue ? ` (${hexValue})` : ''}`}
    />
    <div className="space-y-1">
      <div className="font-medium text-sm text-neutral-900">{name}</div>
      <div className="text-xs text-neutral-600 font-mono">{oklchValue}</div>
      {hexValue && <div className="text-xs text-neutral-500 font-mono">{hexValue}</div>}
    </div>
  </div>
);

interface ColorGroupProps {
  title: string;
  colors: Record<string, string>;
  hexColors?: Record<string, string>;
}

const ColorGroup = ({ title, colors, hexColors }: ColorGroupProps) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(colors).map(([key, value]) => (
        <ColorSwatch
          key={key}
          name={key === 'DEFAULT' ? title : `${title} ${key}`}
          oklchValue={value}
          hexValue={hexColors?.[key]}
        />
      ))}
    </div>
  </div>
);

const ColorPalette = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Time is Money Color Palette</h1>
        <p className="text-neutral-600">
          Brand colors extracted from the logo and supporting design system colors. Values shown in
          OKLCH format with hex equivalents where available.
        </p>
      </div>

      <div className="space-y-8">
        <ColorGroup title="Primary" colors={brandColors.primary} hexColors={hexColors.primary} />

        <ColorGroup
          title="Secondary"
          colors={brandColors.secondary}
          hexColors={hexColors.secondary}
        />

        <ColorGroup title="Accent" colors={brandColors.accent} hexColors={hexColors.accent} />

        <ColorGroup title="Neutral" colors={brandColors.neutral} />

        <ColorGroup title="Success" colors={brandColors.success} />

        <ColorGroup title="Warning" colors={brandColors.warning} />

        <ColorGroup title="Error" colors={brandColors.error} />

        <ColorGroup title="Background" colors={brandColors.background} />
      </div>
    </div>
  );
};

export const Palette: Story = {
  render: () => <ColorPalette />,
  parameters: {
    docs: {
      description: {
        story: 'Complete color palette showing all brand colors with their OKLCH and hex values.',
      },
    },
  },
};
