// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({

  entry: ['src/index', 'src/vite', 'src/webpack', 'src/rollup', 'src/esbuild'],

  format: ["esm", "cjs"],

  target: "es2020",

  sourcemap: true,

  splitting: false,
  external: ['esbuild', 'vite', 'webpack', 'rollup', 'react-router-dom'],
  dts: true,
});

