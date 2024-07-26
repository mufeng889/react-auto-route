import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import type { ElegantRouterNamePathEntry } from '../core';
import { ensureFile } from '../shared/fs';
import type { ElegantReactRouterOption } from '../types';
import { createPrefixCommentOfGenFile } from './comment';
import { getCustomRouteConfig } from './shared';

/**
 * generate the transform file
 *
 * @param options
 */
export async function genTransformFile(options: ElegantReactRouterOption, entries: ElegantRouterNamePathEntry[]) {
  const code = getTransformCode(options, entries);

  const transformPath = path.posix.join(options.cwd, options.transformDir);

  await ensureFile(transformPath);

  await writeFile(transformPath, code);
}

function getTransformCode(options: ElegantReactRouterOption, entries: ElegantRouterNamePathEntry[]) {
  const prefixComment = createPrefixCommentOfGenFile();

  const { entries: customEntries } = getCustomRouteConfig(options, entries);

  const allEntries = [...customEntries, ...entries];

  const code = `${prefixComment}

import type { LazyRouteFunction, RouteObject,IndexRouteObject } from "react-router-dom";
import type { FunctionComponent } from "react";
import type { ElegantConstRoute } from @ohh-889/react-auto-route';
import type { RouteMap, RouteKey, RoutePath } from '@elegant-router/types';
import { redirect } from 'react-router-dom'
import ErrorBoundary  from '@/pages/_builtin/error' 


type CustomRouteObject = Omit<RouteObject, 'Component'|'index'> & {
  Component?: React.ComponentType<any>|null;
};


/**
 * transform elegant const routes to react routes
 * @param routes elegant const routes
 * @param layouts layout components
 * @param views view components
 */
export function transformElegantRoutesToReactRoutes(
  routes: ElegantConstRoute[],
  layouts: Record<string, LazyRouteFunction<CustomRouteObject>>,
  views: Record<string, LazyRouteFunction<CustomRouteObject>>
) {
  return routes.flatMap(route => transformElegantRouteToReactRoute(route, layouts, views));
}

/**
 * transform elegant route to react route
 * @param route elegant const route
 * @param layouts layout components
 * @param views view components
 */
function transformElegantRouteToReactRoute(
  route: ElegantConstRoute,
  layouts: Record<string, LazyRouteFunction<CustomRouteObject>>,
  views: Record<string,LazyRouteFunction<CustomRouteObject>>
):RouteObject  {
  const LAYOUT_PREFIX = 'layout.';
  const VIEW_PREFIX = 'view.';
  const ROUTE_DEGREE_SPLITTER = '_';
  const FIRST_LEVEL_ROUTE_COMPONENT_SPLIT = '$';

  function isLayout(component: string) {
    return component.startsWith(LAYOUT_PREFIX);
  }

  function getLayoutName(component: string) {
    const layout = component.replace(LAYOUT_PREFIX, '');

    if(!layouts[layout]) {
      throw new Error(\`Layout component "\${layout}" not found\`);
    }

    return layout;
  }

  function isView(component: string) {
    return component.startsWith(VIEW_PREFIX);
  }

  function getViewName(component: string) {
    const view = component.replace(VIEW_PREFIX, '');

    if(!views[view]) {
      throw new Error(\`View component "\${view}" not found\`);
    }

    return view;
  }

  function isFirstLevelRoute(item: ElegantConstRoute) {
    return !item.name.includes(ROUTE_DEGREE_SPLITTER);
  }

  function isSingleLevelRoute(item: ElegantConstRoute) {
    return isFirstLevelRoute(item) && !item.children?.length;
  }

  function getSingleLevelRouteComponent(component: string) {
    const [layout, view] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT);

    return {
      layout: getLayoutName(layout),
      view: getViewName(view)
    };
  }


  const { name,props, path,meta, component, children,redirectTo,layout,loader, ...rest } = route;

  const reactRoute = {id:name, path,handle: {
    ...meta
  }, children:[],ErrorBoundary }as RouteObject

  try {
    if (component) {
      if (isSingleLevelRoute(route)) {
        const { layout, view } = getSingleLevelRouteComponent(component);

         if (layout) {
          const singleLevelRoute:RouteObject= {
            path,
            lazy: layouts[layout],
            children: [
              {
                id:name,
                index: true,
                lazy: views[view],
                handle: {
                  ...meta
                },
                ...rest
              } as IndexRouteObject
            ]
          };

        return singleLevelRoute;
        }

    return {
          path,
          lazy: views[view],
          id: name,
          ...rest
       } as RouteObject;
      }

      if (isLayout(component)) {
        if (layout) {
          reactRoute.lazy=views[name]
        } else {
          const layoutName = getLayoutName(component);
          reactRoute.lazy = layouts[layoutName];
        }

      }


      if (isView(component)) {
        const viewName = getViewName(component);
        if (props) {
          reactRoute.lazy = async () => {
           const data= (await views[viewName]()).Component as FunctionComponent
            return {
            element: data(props) ,
             ErrorBoundary
            }
          }
        } else {
          reactRoute.lazy = views[viewName]
        }
      }

    }
  } catch (error: any) {
    console.error(\`Error transforming route "\${route.name}": \${error.toString()}\`);
    return {};
  }

if (redirectTo) {
    reactRoute.loader=()=>redirect(redirectTo)
  }

  if (loader) {
    reactRoute.loader = () => loader
  }


 if (children?.length) {
    reactRoute.children = children.flatMap(child => transformElegantRouteToReactRoute(child, layouts, views));

    if (!redirectTo) {
      reactRoute.children.unshift({
        index: true,
        loader: () => redirect(getRedirectPath(path as string,children[0].path as string) ),
        ...rest
      });
    }
  }

  if (layout) {

    return {
      lazy: layouts[layout],
      children: [reactRoute],
      ErrorBoundary
    }as RouteObject;
  }

  return reactRoute;
}

/**
 * map of route name and route path
 */
const routeMap: RouteMap = {
  ${allEntries.map(([routeName, routePath]) => `"${routeName}": "${routePath}"`).join(',\n  ')}
};

/**
 * get route path by route name
 * @param name route name
 */
export function getRoutePath<T extends RouteKey>(name: T) {
  return routeMap[name];
}

/**
 * get route name by route path
 * @param path route path
 */
export function getRouteName(path: RoutePath) {
  const routeEntries = Object.entries(routeMap) as [RouteKey, RoutePath][];

  const routeName: RouteKey | null = routeEntries.find(([, routePath]) => routePath === path)?.[0] || null;

  return routeName;
}

/**
 * get route redirect path
 * @param path route path
 */
function getRedirectPath(path: string, childrenPath: string) {
   if(path.startsWith('/')){
     return path +'/' + childrenPath;
   }
     return   childrenPath
}
`;

  return code;
}
