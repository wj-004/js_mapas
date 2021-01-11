import cjs from '@rollup/plugin-commonjs';
import node from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/typescript/index.ts',
  output: [
    {file: 'js/index.js', format: 'iife'}
  ],
  plugins: [
    typescript(),
    node(),
    cjs(),
  ],
  onwarn: function(warning, superOnWarn) {
    /*
     * skip certain warnings
     * https://github.com/openlayers/openlayers/issues/10245
     */
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    superOnWarn(warning);
  }
};