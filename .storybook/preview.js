import React from 'react';
import { configureActions } from '@storybook/addon-actions';
import { themes } from '@storybook/theming';

// import '../src/styles.css';
import '@togglecorp/toggle-ui/build/index.css';

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    darkMode: {
        dark: { ...themes.dark, appBg: '#313131' },
        light: { ...themes.normal, appBg: '#f0f0f0' },
        current: 'light',
    },
    viewMode: 'docs',
}

configureActions({
    depth: 3,
    // Limit the number of items logged into the actions panel
    limit: 20,
});
