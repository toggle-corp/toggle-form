const eslintrc = require('./.eslintrc.js');

var eslintrcLoader = {
    ...eslintrc,
    rules: {
        ...eslintrc.rules,
    },
};

module.exports = eslintrcLoader;
