import { createUnplugin } from 'unplugin';
import ElegantReactRouter from './route-core';
import type { ElegantConstRoute, ElegantReactRouterOption } from './types';

export default createUnplugin<Partial<ElegantReactRouterOption> | undefined>((options) => {
  const ctx = new ElegantReactRouter(options);

  return [
    {
      name: 'react-auto-route',
      enforce: 'pre',
      vite: {
        apply: 'serve',
        configResolved() {
          ctx.setupFSWatcher();
        },
        configureServer(server) {
          ctx.setViteServer(server);
        }
      }
    },
  ];
});

export type { ElegantReactRouterOption, ElegantConstRoute };
