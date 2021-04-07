import React from 'react';
import { configureActions } from '@storybook/addon-actions';
import { useDarkMode } from 'storybook-dark-mode';
import { themes } from '@storybook/theming';

// import '../src/styles.css';

import UiModeContext from '../src/components/UiModeContext';

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    darkMode: {
        dark: { ...themes.dark, appBg: '#313131' },
        light: { ...themes.normal, appBg: '#f0f0f0' },
        current: 'light',
    },
}

configureActions({
    depth: 3,
    // Limit the number of items logged into the actions panel
    limit: 20,
});


const withDarkMode = (Story, context) => {
    const isDarkMode = useDarkMode();
    const { setUiMode } = React.useContext(UiModeContext);
    const uiMode = isDarkMode ? 'dark' : 'light';

    const contextValue = React.useMemo(() => ({ uiMode }), [uiMode]);
    // Using `Story(context)` instead of `<Story {...context{ />` else the story gets dismounted
    // https://github.com/storybookjs/storybook/issues/12255#issuecomment-697956943
    return (
        <UiModeContext.Provider value={contextValue}>
            {Story(context)}
        </UiModeContext.Provider>
    );
}

export const decorators = [withDarkMode];
