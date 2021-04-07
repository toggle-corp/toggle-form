import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import { eslint } from 'rollup-plugin-eslint';

/*
import postcss from 'rollup-plugin-postcss';
import stylelint from 'rollup-plugin-stylelint';
import postcssPresetEnv from 'postcss-preset-env';
import postcssNested from 'postcss-nested';
import postcssNormalize from 'postcss-normalize';
*/

import pkg from './package.json';

const INPUT_FILE_PATH = 'src/index.ts';

const PLUGINS = [
    /*
    stylelint(),
    postcss({
        extract: true,
        modules: {
            localsConvention: 'camelCaseOnly',
        },
        autoModules: false,
        plugins: [
            // autoprefixer,
            postcssPresetEnv,
            postcssNested,
            postcssNormalize,
        ],
    }),
    */
    eslint({
        throwOnError: true,
        include: ['**/*.jsx', '**/*.js', '**/*.ts', '**/*.tsx'],
    }),
    babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.jsx', '.js', '.ts', '.tsx'],
    }),
    resolve({
        browser: true,
        extensions: ['.jsx', '.js', '.ts', '.tsx'],
    }),
    commonjs(),
    filesize(),
];

const OUTPUT_DATA = [
    {
        file: pkg.main,
        format: 'cjs',
    },
    {
        file: pkg.module,
        format: 'es',
    },
];

const config = OUTPUT_DATA.map(({ file, format }) => ({
    input: INPUT_FILE_PATH,
    output: {
        file,
        format,
        sourcemap: true,
        exports: 'named',
    },
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: PLUGINS,
}));

export default config;
