import typescript from '@rollup/plugin-typescript';

// Configuracion por defecto para Rollup + TypeScript
// Tomada de https://www.npmjs.com/package/@rollup/plugin-typescript

export default {
  input: 'src/typescript/index.ts',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [typescript()]
};