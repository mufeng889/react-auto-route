import type { ElegantRouterOption } from '../core';
import type { ElegantReactRouterOption } from '../types';

/**
 * create the plugin options
 *
 * @param options the plugin options
 */
export function createPluginOptions(erOptions: ElegantRouterOption, options?: Partial<ElegantReactRouterOption>) {
  const DTS_DIR = 'src/types/elegant-router.d.ts';
  const IMPORT_DIR = 'src/router/elegant/imports.ts';
  const CONST_DIR = 'src/router/elegant/routes.ts';
  const TRANSFORM_DIR = 'src/router/elegant/transform.ts';
  const CUSTOM_ROUTES_MAP: Record<string, string> = {
    root: '/',
    'not-found': '*'
  };
  const DEFAULT_LAYOUTS: Record<string, string> = {
    base: 'src/layouts/base-layout/index.tsx',
    blank: 'src/layouts/blank-layout/index.tsx'
  };

  const opts: ElegantReactRouterOption = {
    dtsDir: DTS_DIR,
    importsDir: IMPORT_DIR,
    lazyImport: _name => true,
    constDir: CONST_DIR,
    customRoutes: {
      map: {},
      names: []
    },
    layouts: DEFAULT_LAYOUTS,
    defaultLayout: Object.keys(DEFAULT_LAYOUTS)[0],
    layoutLazyImport: _name => true,
    transformDir: TRANSFORM_DIR,
    onRouteMetaGen: name => ({
      title: name
    }),
    ...erOptions,
    ...options
  };

  opts.customRoutes.map = {
    ...CUSTOM_ROUTES_MAP,
    ...opts.customRoutes.map
  };

  if (!opts.layouts[opts.defaultLayout]) {
    opts.defaultLayout = Object.keys(opts.layouts)[0];
  }

  return opts;
}
