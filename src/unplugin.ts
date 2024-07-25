import path from 'node:path';
import { createUnplugin } from 'unplugin';
import ElegantReactRouter from './route-core';
import type { ElegantConstRoute, ElegantReactRouterOption } from './types';

export default createUnplugin<Partial<ElegantReactRouterOption> | undefined>((options, _meta) => {
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
    {
      name: '@ohh-899/inject-name',
      enforce: 'pre',
      transformInclude(id) {
        const { cwd, pageDir } = ctx.elegantRouter.options;

        const isInPageDir = id.startsWith(path.posix.join(cwd, pageDir));

        if (!isInPageDir) return null;

        const filePath = path.posix.join(cwd, pageDir);

        const glob = id.replace(`${filePath}/`, '');

        return ctx.elegantRouter.isMatchPageGlob(glob);
      }
    }
  ];
});

export type { ElegantReactRouterOption, ElegantConstRoute };
