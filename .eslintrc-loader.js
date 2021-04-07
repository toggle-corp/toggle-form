const eslintrc = require('./.eslintrc.js');

var eslintrcLoader = {
    ...eslintrc,
    rules: {
        ...eslintrc.rules,
        // Disable on js build
        'postcss-modules/no-unused-class': 0,
        'postcss-modules/no-undef-class': 0,
    },
};

module.exports = eslintrcLoader;
