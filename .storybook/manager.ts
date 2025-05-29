import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// Apply theme to Storybook UI
addons.setConfig({
  theme: themes.light,
});
