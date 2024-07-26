import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/vite', 'src/webpack', 'src/rollup', 'src/esbuild'],
  clean: true,
  declaration: true,
  externals: ['esbuild', 'vite', 'webpack', 'rollup', 'react-router-dom'],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      minify: true
    }
  }
});
