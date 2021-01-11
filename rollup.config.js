import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/main.js',
    output: {
      name: 'initKbCytoscape',
      file: pkg.browser,
      format: 'umd',
      globals: {
        jquery: '$',
      },
    },
    plugins: [
      resolve(), // ensure Rollup can find node_modules
      commonjs(), // ensure Rollup can convert node_modules to ES module format
    ],
    external: ['jquery'],
  },
];
