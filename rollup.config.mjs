import { readFileSync } from 'node:fs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default {
  input: 'src/touchpad-card.ts',
  output: {
    file: 'dist/touchpad-card.js',
    format: 'es',
    sourcemap: false,
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: { __CARD_VERSION__: JSON.stringify(version) },
    }),
    nodeResolve(),
    typescript({ noEmit: false, outDir: 'dist', declaration: false }),
    terser({ format: { comments: false } }),
  ],
};
