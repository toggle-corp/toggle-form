import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import eslint from '@rollup/plugin-eslint';
import pkg from './package.json' assert { type: 'json' };

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
];

const OUTPUT_DATA = [
    {
        dir: 'build/cjs',
        format: 'cjs',
        entryFileNames: '[name].cjs'
    },
    {
        dir: 'build/esm',
        format: 'esm',
        preserveModules: true,
        preserveModulesRoot: 'src',
    },
];

// Treat every dependency / peerDependency — and any of their subpath imports such as
// `core-js-pure/stable/...` or `@babel/runtime-corejs3/helpers/...` — as external. A plain
// string list only matches exact ids, which would wrongly try to bundle subpath imports.
const EXTERNAL = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
];
const isExternal = (id) => EXTERNAL.some((dep) => id === dep || id.startsWith(`${dep}/`));

const config = OUTPUT_DATA.map((options) => ({
    input: INPUT_FILE_PATH,
    output: {
        ...options,
        sourcemap: true,
        exports: 'named',
    },
    external: isExternal,
    plugins: PLUGINS,
}));

export default config;
