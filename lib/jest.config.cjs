module.exports = {
    roots: [
        '<rootDir>/src',
    ],
    collectCoverageFrom: [
        '**/*.{js,ts}',
        '!**/node_modules/**',
    ],
    transform: {
        '^.+\\.(js|ts)?$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)?$',
    moduleFileExtensions: [
        'ts',
        'js',
        'json',
    ],
};
