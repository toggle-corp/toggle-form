import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import eslint from '@rollup/plugin-eslint';
import copy from 'rollup-plugin-copy';

import pkg from './package.json';

const INPUT_FILE_PATH = 'src/index.ts';

const PLUGINS = [
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
    copy({
        targets: [
            { src: ['src/schema.d.ts', 'src/nullHelper.d.ts'], dest: 'build/esm' },
        ],
    }),
];

const OUTPUT_DATA = [
    {
        dir: 'build/cjs',
        format: 'cjs',
    },
    {
        dir: 'build/esm',
        format: 'esm',
        preserveModules: true,
        preserveModulesRoot: 'src',
    },
];

const config = OUTPUT_DATA.map((options) => ({
    input: INPUT_FILE_PATH,
    output: {
        ...options,
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
