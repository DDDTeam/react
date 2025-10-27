import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import filesize from 'rollup-plugin-filesize';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';

const config = [
  {
    input: 'src/index.ts',
    plugins: [
      nodeResolve({extensions: ['.js', '.ts', '.tsx']}),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist/types-temp',
          emitDeclarationOnly: false,
          declarationMap: false,
          allowImportingTsExtensions: false,
          noEmit: false,
        },
      }),
      cleanup(),
    ],
    output: [
      {
        file: 'dist/react.js',
        format: 'esm',
        sourcemap: true,
        plugins: [filesize()],
      },
      {
        file: 'dist/react.min.js',
        format: 'esm',
        sourcemap: true,
        plugins: [terser(), filesize()],
      },
    ],
  },

  {
    input: 'src/jsx/jsx-runtime.ts',
    plugins: [
      nodeResolve({extensions: ['.js', '.ts', '.tsx']}),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: false,
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist/jsx/types-temp',
          emitDeclarationOnly: false,
          declarationMap: false,
          allowImportingTsExtensions: false,
          noEmit: false,
        },
      }),
      cleanup(),
    ],
    output: [
      {
        file: 'dist/jsx/jsx-runtime.js',
        format: 'esm',
        sourcemap: false,
        plugins: [filesize()],
      },
    ],
  },
  {
    input: 'src/jsx/jsx-dev-runtime.ts',
    plugins: [
      nodeResolve({extensions: ['.js', '.ts', '.tsx']}),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: false,
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist/jsx/types-temp',
          emitDeclarationOnly: false,
          declarationMap: false,
          allowImportingTsExtensions: false,
          noEmit: false,
        },
      }),
      cleanup(),
    ],
    output: [
      {
        file: 'dist/jsx/jsx-dev-runtime.js',
        format: 'esm',
        sourcemap: false,
        plugins: [filesize()],
      },
    ],
  },
  {
    input: 'dist/types-temp/index.d.ts',
    output: {
      file: 'dist/react.d.ts',
      format: 'es',
    },
    plugins: [dts(), del({targets: ['dist/types-temp'], hook: 'writeBundle'})],
  },
  {
    input: 'dist/jsx/types-temp/jsx/jsx-runtime.d.ts',
    output: {
      file: 'dist/jsx/jsx-runtime.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  {
    input: 'dist/jsx/types-temp/jsx/jsx-dev-runtime.d.ts',
    output: {
      file: 'dist/jsx/jsx-dev-runtime.d.ts',
      format: 'es',
    },
    plugins: [dts(), del({targets: ['dist/jsx/types-temp'], hook: 'writeBundle'})],
  },
];

export default config;
