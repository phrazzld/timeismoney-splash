import type { Meta, StoryObj } from '@storybook/react';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  typographyPresets,
} from '../../design-tokens/typography';

const meta: Meta = {
  title: 'Design Tokens/Typography',
  parameters: {
    controls: { hideNoControlsWarning: true },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface FontSampleProps {
  name: string;
  value: string | number;
  sampleText?: string;
  style?: React.CSSProperties;
}

const FontSample = ({
  name,
  value,
  sampleText = 'The quick brown fox jumps over the lazy dog',
  style,
}: FontSampleProps): React.JSX.Element => (
  <div className="border border-neutral-200 rounded-lg p-4 mb-3">
    <div className="flex justify-between items-start mb-2">
      <span className="text-sm font-medium text-neutral-900">{name}</span>
      <span className="text-xs font-mono text-neutral-600">{value}</span>
    </div>
    <div style={style} className="text-neutral-800">
      {sampleText}
    </div>
  </div>
);

interface TypographyGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const TypographyGroup = ({
  title,
  description,
  children,
}: TypographyGroupProps): React.JSX.Element => (
  <div className="mb-12">
    <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
    {description && <p className="text-sm text-neutral-600 mb-6">{description}</p>}
    <div>{children}</div>
  </div>
);

interface PresetSampleProps {
  name: string;
  preset: (typeof typographyPresets)[keyof typeof typographyPresets];
  sampleText: string;
}

const PresetSample = ({ name, preset, sampleText }: PresetSampleProps): React.JSX.Element => (
  <div className="border border-neutral-200 rounded-lg p-6 mb-4">
    <div className="flex justify-between items-start mb-3">
      <span className="text-sm font-semibold text-neutral-900">{name}</span>
      <div className="text-xs font-mono text-neutral-600 text-right">
        <div>
          {preset.fontSize} / {preset.fontWeight}
        </div>
        <div>line-height: {preset.lineHeight}</div>
        {preset.letterSpacing !== letterSpacings.normal && (
          <div>letter-spacing: {preset.letterSpacing}</div>
        )}
      </div>
    </div>
    <div style={preset as React.CSSProperties} className="text-neutral-800">
      {sampleText}
    </div>
  </div>
);

const TypographyTokens = (): React.JSX.Element => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Time is Money Typography</h1>
        <p className="text-neutral-600">
          Typography design tokens including font families, sizes, weights, and preset combinations.
        </p>
      </div>

      <TypographyGroup
        title="Font Families"
        description="Primary typefaces used throughout the application"
      >
        <FontSample
          name="Sans (Geist Sans)"
          value="Geist Sans"
          style={{ fontFamily: fontFamilies.sans }}
        />
        <FontSample
          name="Mono (Geist Mono)"
          value="Geist Mono"
          style={{ fontFamily: fontFamilies.mono }}
          sampleText="const timeIsMoney = calculateHourlyWage();"
        />
      </TypographyGroup>

      <TypographyGroup title="Font Sizes" description="Type scale from extra small to 9xl">
        {Object.entries(fontSizes).map(([key, value]) => (
          <FontSample
            key={key}
            name={key}
            value={value}
            style={{ fontSize: value }}
            sampleText="Time is Money helps you make better purchasing decisions"
          />
        ))}
      </TypographyGroup>

      <TypographyGroup title="Font Weights" description="Available font weight variations">
        {Object.entries(fontWeights).map(([key, value]) => (
          <FontSample key={key} name={key} value={value.toString()} style={{ fontWeight: value }} />
        ))}
      </TypographyGroup>

      <TypographyGroup title="Line Heights" description="Spacing between lines of text">
        {Object.entries(lineHeights).map(([key, value]) => (
          <FontSample
            key={key}
            name={key}
            value={value}
            style={{ lineHeight: value }}
            sampleText="This text demonstrates line height spacing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          />
        ))}
      </TypographyGroup>

      <TypographyGroup
        title="Letter Spacing"
        description="Tracking adjustments for different text styles"
      >
        {Object.entries(letterSpacings).map(([key, value]) => (
          <FontSample
            key={key}
            name={key}
            value={value}
            style={{ letterSpacing: value }}
            sampleText="LETTER SPACING DEMONSTRATION"
          />
        ))}
      </TypographyGroup>

      <TypographyGroup
        title="Typography Presets"
        description="Pre-configured combinations for common use cases"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-neutral-800 mb-3">Headings</h4>
            <PresetSample
              name="H1"
              preset={typographyPresets.h1}
              sampleText="Convert Prices to Hours"
            />
            <PresetSample
              name="H2"
              preset={typographyPresets.h2}
              sampleText="Make Smarter Purchasing Decisions"
            />
            <PresetSample
              name="H3"
              preset={typographyPresets.h3}
              sampleText="See the True Cost of Everything"
            />
            <PresetSample
              name="H4"
              preset={typographyPresets.h4}
              sampleText="Automatic Price Conversion"
            />
            <PresetSample
              name="H5"
              preset={typographyPresets.h5}
              sampleText="Privacy-First Design"
            />
            <PresetSample
              name="H6"
              preset={typographyPresets.h6}
              sampleText="Available for Chrome"
            />
          </div>

          <div>
            <h4 className="text-lg font-medium text-neutral-800 mb-3">Body Text</h4>
            <PresetSample
              name="Body Large"
              preset={typographyPresets.bodyLarge}
              sampleText="Time is Money automatically converts prices on any website into hours of your work, helping you understand the true cost of purchases."
            />
            <PresetSample
              name="Body"
              preset={typographyPresets.body}
              sampleText="Our Chrome extension works seamlessly in the background, converting prices based on your hourly wage. No manual calculations needed."
            />
            <PresetSample
              name="Body Small"
              preset={typographyPresets.bodySmall}
              sampleText="Compatible with all major e-commerce sites. Your wage information is stored locally and never shared."
            />
          </div>

          <div>
            <h4 className="text-lg font-medium text-neutral-800 mb-3">Utility Text</h4>
            <PresetSample
              name="Caption"
              preset={typographyPresets.caption}
              sampleText="*Prices shown are converted based on your configured hourly wage"
            />
            <PresetSample
              name="Overline"
              preset={typographyPresets.overline}
              sampleText="New Feature"
            />
            <PresetSample name="Label" preset={typographyPresets.label} sampleText="Hourly Wage" />
          </div>

          <div>
            <h4 className="text-lg font-medium text-neutral-800 mb-3">Code</h4>
            <PresetSample
              name="Code"
              preset={typographyPresets.code}
              sampleText="calculateWorkHours(price, hourlyWage)"
            />
            <PresetSample
              name="Code Block"
              preset={typographyPresets.codeBlock}
              sampleText={`function convertPrice(price: number, wage: number): string {
  const hours = price / wage;
  return \`\${hours.toFixed(1)} hours of work\`;
}`}
            />
          </div>
        </div>
      </TypographyGroup>
    </div>
  );
};

export const Tokens: Story = {
  render: () => <TypographyTokens />,
  parameters: {
    docs: {
      description: {
        story: 'Complete typography system showing all font tokens and preset combinations.',
      },
    },
  },
};
