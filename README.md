# ElegantRouter

English | [中文](./README.zh_CN.md)

## Introduction

ElegantRouter is a tool for creating routes based on the file system, which can automatically generate route definitions, route file imports and route-related type definitions. Just create the route file according to the agreed rules, without adding any additional configuration in the route file.

### Differences and similarities

The main difference between ElegantRouter and other file system-based routing tools is that:

1. Other tools have complex configuration rules, and the route data is a black box, which is difficult to customize.
2. ElegantRouter follows the api-first principle and automates the process of configuring routes.

Taking configuring react routes as an example, the traditional way of creating page routes requires the following steps:

1. Import the layout component
2. Import the page component
3. Define the route in the route configuration file

Although these steps are not complicated, in actual development, they are repetitive and need to be done manually. In addition, the maintenance of route names and paths is very troublesome, there is no clear agreement on the route definition of the layout and page components, resulting in a messy route definition.
And using ElegantRouter, you only need to create the route file according to the agreed rules, you can automatically generate the route in the specified route file.

### ElegantRouter's route configuration process

You only need to create a route file according to the agreed rules to generate the route in the specified route file.

## Installation

### Install the react version (other frameworks to come...)

```bash
pnpm install @ohh-889/react-auto-route
```

## Attention item

### `react-router-dom`

- Versions that require installation above 'v6' are not compatible with the lower version of 'react-router-dom'

### Lazy loading by route

- Page routing

``` ts

export function Component() {
  return <div>Component</div>;
}

```
- Be sure to export with 'export' as the function name 'Component'

#### If you want to use the default export

**1. Override the lazy method**

```tsx
lazy:async ()=>{
 const component=await import('@/views/Component.tsx')

 return {
  Component:component.default
  ErrorBoundary:ErrorBoundary,
 }
//  or you can use the following code
const Component=component.default
return {
  element:<Component />,
  ErrorBoundary:ErrorBoundary,
}
}
```
- If you use ts, change the ts type declaration


**2. Handle route lazy loading by yourself**

- Use an 'option' of the route loader

`optsunstable_datastrategy`

- [related links](https://reactrouter.com/en/main/routers/create-browser-router#optsunstable_datastrategy) 


## Best practice


- **react-soybean-admin**
  - [Preview address](https://github.com/mufeng889/react-soybean-admin)

- **Source of inspiration**

  - [elegant-router](https://github.com/soybeanjs/elegant-router)

> **elegant-router best practice**
> `soybean-admin` [Preview address](https://github.com/soybeanjs/soybean-admin)
> - This is a 'vue' technology stack back-end management system project

## Use

### Introduce the plugin in Vite

```ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ElegantVueRouter from "@@ohh-889/react-auto-route";

export default defineConfig({
  plugins: [
    react(),
    ElegantreactRouter({
      alias: {
        "@": "src",
      },
      layouts: {
        base: "src/layouts/base-layout/index.tsx",
        blank: "src/layouts/blank-layout/index.tsx",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

### Integration in react Router

**src/router/routes/index.ts**

```ts
import type { ElegantRoute, CustomRoute } from "@elegant-router/types";
import { generatedRoutes } from "../elegant/routes";
import { layouts, views } from "../elegant/imports";
import { transformElegantRoutesToReactRoutes } from "../elegant/transform";

const customRoutes: CustomRoute[] = [
  {
    name: "root",
    path: "/",
    redirectTo: '/home',
  },
  {
    name: "not-found",
    path: "*",
    component: "$view.404",
  },
];

const elegantRoutes: ElegantRoute[] = [...customRoutes, ...generatedRoutes];

export const routes = transformElegantRoutesToreactRoutes(
  elegantRoutes,
  layouts,
  views
);
```

**src/router/index.ts**

```ts
import {createBrowserRouter} from 'react-router-dom'
import { routes } from "./routes";

export const router=createBrowserRouter(builtinRoutes)
```


**src/App.tsx**

```ts
import { RouterProvider } from 'react-router-dom';
import { router } from "@/router";

const App = () => {
  return <RouterProvider router={reactRouter} />
}

```

### Starting the project

After starting the project, the plugin will automatically generate the src/router/elegant directory, and the files in this directory are the automatically generated route import, route definition and route transformation files.

## Configuration

### Route file creation

You can configure `pagePatterns` to specify the rules for creating route files. The rules for creating route files are regular expressions, and if the path of a route file matches the regular expression, the route file will be created.

Default: all files named `index.tsx`、`[id].tsx`、`[module].tsx`, etc. below the folder.

```ts
pagePatterns: ["**‍/index.tsx", "**‍/[[]*[]].tsx"];
```

### One-level route (single-level route)

#### Folder structure

```
views
├── about
│   └── index.tsx
```

#### Generated routes

```ts
{
  name: 'about',
  path: '/about',
  component: 'layout.base$view.about',
  meta: {
    title: 'about'
  }
},
```

> it is a single level route, to add layout, the component props combines the layout and view component, split by the dollar sign "$"

#### Transformed react routes

```ts
{
  path: '/about',
  component: BaseLayout,
  ErrorBoundary: ErrorBoundary,
  children: [
    {
      id: 'about',
      index:true,
      lazy: () => import('@/pages/about/index.tsx'),
      handle: {
        title: 'about'
      }
    }
  ]
},
```

### Secondary route

#### Folder structure

```
views
├── list
│   ├── home
│   │   └── index.tsx
│   ├── detail
│   │   └── index.tsx
```

> Please don't have the following index.tsx on the same level as the folder, this is not part of the agreed upon rules

**Error example**

```
views
├── list
│   ├── index.tsx
│   ├── detail
│   │   └── index.tsx
```

#### Generated routes

```ts
{
  name: 'list',
  path: '/list',
  component: 'layout.base',
  meta: {
    title: 'list'
  },
  children: [
    {
      name: 'list_home',
      path: 'home',
      component: 'view.list_home',
      meta: {
        title: 'list_home'
      }
    },
    {
      name: 'list_detail',
      path: 'detail',
      component: 'view.list_detail',
      meta: {
        title: 'list_detail'
      }
    },
  ]
}
```

> There are two layers of route data for secondary routes, the first layer of route is the layout component and the second layer of route is the page component

#### Transformed react routes

```ts
{
  name: 'list',
  path: '/list',
  component: BaseLayout,
  ErrorBoundary: ErrorBoundary,
  loader: ()=>redirect('/list/home'),
  handle: {
    title: 'list'
  },
  children: [
   {
      name: 'list_home',
      path: 'home',
      lazy: () => import('@/views/list/home/index.tsx'),
      handle: {
        title: 'list_home'
      }
    },
    {
      name: 'list_detail',
      path: 'detail',
      lazy: () => import('@/views/list/detail/index.tsx'),
      handle: {
        title: 'list_detail'
      }
    }
  ]
},
```

> the first layer of route data contains the redirection configuration, which by default redirects to the first sub-route

### Multi-level route (level 3 route and above)

#### Folder structure

- The folder hierarchy is deep

```
views
├── multi-menu
│   ├── first
│   │   ├── child
│   │   │   └── index.tsx
│   ├── second
│   │   ├── child
│   │   │   ├── home
│   │   │   │   └── index.tsx
```

- Two-tier folder hierarchy (recommended)

```
views
├── multi-menu
│   ├── first_child
│   │   └── index.tsx
│   ├── second_child_home
│   │   └── index.tsx
```

> The route hierarchy is split by the underscore symbol "\_", which prevents the folder hierarchy from being too deep.

#### Generated routes

```ts
{
  name: 'multi-menu',
  path: '/multi-menu',
  component: 'layout.base',
  meta: {
    title: 'multi-menu'
  },
  children: [
    {
      name: 'multi-menu_first',
      path: 'first',
      meta: {
        title: 'multi-menu_first'
      },
      children: [
        {
          name: 'multi-menu_first_child',
          path: 'child',
          component: 'view.multi-menu_first_child',
          meta: {
            title: 'multi-menu_first_child'
          }
        }
      ]
    },
    {
      name: 'multi-menu_second',
      path: 'second',
      meta: {
        title: 'multi-menu_second'
      },
      children: [
        {
          name: 'multi-menu_second_child',
          path: 'child',
          meta: {
            title: 'multi-menu_second_child'
          },
          children: [
            {
              name: 'multi-menu_second_child_home',
              path: 'home',
              component: 'view.multi-menu_second_child_home',
              meta: {
                title: 'multi-menu_second_child_home'
              }
            }
          ]
        }
      ]
    }
  ]
}
```

> if the route level is greater than 2, the generated route data is a recursive structure

#### Transformed react routes

```ts
{
  name: 'multi-menu',
  path: '/multi-menu',
  component: BaseLayout,
  redirect: {
    name: 'multi-menu_first'
  },
  meta: {
    title: 'multi-menu'
  },
  children: [
    {
      name: 'multi-menu_first',
      path: 'first',
      loader:()=>redirect('child')},
      handle: {
        title: 'multi-menu_first'
      },
      children: [
     {
      name: 'multi-menu_first_child',
      path: 'child',
      lazy: () => import('@/views/multi-menu/first_child/index.tsx'),
      handle: {
        title: 'multi-menu_first_child'
      }
    },
      ]
    },
    {
      name: 'multi-menu_second',
      path: 'second',
      loader:()=>redirect('child'),
      handle: {
        title: 'multi-menu_second'
      },
      children:[
        {
      name: 'multi-menu_second_child',
      path: 'child',
      loader:()=>redirect('home'),
      handle: {
        title: 'multi-menu_second_child'
      },
      children:[
      {
      name: 'multi-menu_second_child_home',
      path: 'home', 
      lazy: () => import('@/views/multi-menu/second_child_home/index.tsx'),
      handle: {
        title: 'multi-menu_second_child_home'
      }
      }
      ]
    },
      ]
    },
    
    
  ]
},
```

## Access`meta`

```tsx
import { useMatches } from "react-router-dom";

const matches = useMatches();
const meta= matches[matches.length - 1].handle;
```
- [related links](https://reactrouter.com/en/main/hooks/use-matches)

> the transformed react routes only has two levels, the first level is the layout component, and the second level is the redirect routes or the page routes

### Ignore folder aggregation routes

Folder names that begin with an underscore "\_" will be ignored

#### Folder structure

```
views
├── _error
│   ├── 403
│   │   └── index.tsx
│   ├── 404
│   │   └── index.tsx
│   ├── 500
│   │   └── index.tsx
```

#### Generated routes

```ts
{
  name: '403',
  path: '/403',
  component: 'layout.base$view.403',
  meta: {
    title: '403'
  }
},
{
  name: '404',
  path: '/404',
  component: 'layout.base$view.404',
  meta: {
    title: '404'
  }
},
{
  name: '500',
  path: '/500',
  component: 'layout.base$view.500',
  meta: {
    title: '500'
  }
},
```

### Parameter Route

#### Folder structure

```
views
├── user
│   └── [id].tsx
```

#### Generated routes

```ts
{
  name: 'user',
  path: '/user/:id',
  component: 'layout.base$view.user',
  props: true,
  meta: {
    title: 'user'
  }
}
```

#### Advanced parameter route

```ts
import type { RouteKey } from "@elegant-router/types";

ElegantreactRouter({
  routePathTransformer(routeName, routePath) {
    const routeKey = routeName as RouteKey;

    if (routeKey === "user") {
      return "/user/:id(\\d+)";
    }

    return routePath;
  },
});
```

### Custom Route

the custom route is only used to generate the route declaration, and the route file is not generated, you should create the route file manually.

#### Config custom routes

```ts
ElegantreactRouter({
  customRoutes: {
    map: {
      root: "/",
      notFound: "*",
    },
    names: ["two-level_route"],
  },
});
```

**Generated CustomRouteKey**

```ts
type RouteMap = {
  root: "/";
  notFound: "*";
  "two-level": "/two-level";
  "two-level_route": "route";
};

type CustomRouteKey = "root" | "notFound" | "two-level" | "two-level_route";
```

#### Custom routes's component

**it can use existing page components as the route component**

```ts
import type { CustomRoute } from "@elegant-router/types";

const customRoutes: CustomRoute[] = [
  {
    name: "root",
    path: "/",
    redirectTo: {
      name: "403",
    },
  },
  {
    name: "not-found",
    path: "*",
    component: "layout.base$view.404",
  },
  {
    name: "two-level",
    path: "/two-level",
    component: "layout.base",
    children: [
      {
        name: "two-level_route",
        path: "/two-level/route",
        component: "view.about",
      },
    ],
  },
];
```

## Plugin Option

`ElegantRouterOption`:

| property             | instruction                                                                                                           | type                                                | default value                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------- |
| cmd                  | the root directory of the project                                                                                     | `string`                                            | `process.cwd()`                        |
| pageDir              | the relative path to the root directory of the pages                                                                  | `string`                                            | `"src/views"`                          |
| alias                | alias, it can be used for the page and layout file import path                                                        | `Record<string, string>`                            | `{ "@": "src" }`                       |
| pagePatterns         | the patterns to match the page files (the match syntax follow [micromatch](https://github.com/micromatch/micromatch)) | `string[]`                                          | `["**‍/index.react", "**‍/[[]*[]].react"]` |
| pageExcludePatterns  | the patterns to exclude the page files (The default exclusion folder `components` is used as the routing page file.)  | `string[]`                                          | `["**‍/components/**"]`                |
| routeNameTransformer | transform the route name (The default is the name of the folder connected by an underscore)                           | `(routeName: string) => string`                     | `routeName => routeName`               |
| routePathTransformer | transform the route path                                                                                              | `(transformedName: string, path: string) => string` | `(_transformedName, path) => path`     |

`ElegantreactRouterOption`:

> extends `ElegantRouterOption`

| property         | instruction                                                                                                                                  | type                                               | default value                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| dtsDir           | the declaration file directory of the generated routes                                                                                       | `string`                                           | `"src/typings/elegant-router.d.ts"`                                                          |
| importsDir       | the directory of the imports of routes                                                                                                       | `string`                                           | `"src/router/elegant/imports.ts"`                                                            |
| lazyImport       | whether the route is lazy import                                                                                                             | `(routeName: string) => boolean`                   | `_name => true`                                                                              |
| constDir         | the directory of the route const                                                                                                             | `string`                                           | `"src/router/elegant/routes.ts"`                                                             |
| customRoutes     | define custom routes, which's route only generate the route declaration                                                                      | `{ map: Record<string, string>; names: string[] }` | `{ map: { root: "/", notFound: "*" }, names: []}`                            |
| layouts          | the name and file path of the route layouts                                                                                                  | `Record<string, string>`                           | `{ base: "src/layouts/base-layout/index.tsx", blank: "src/layouts/blank-layout/index.tsx" }` |
| defaultLayout    | the default layout name used in generated route const ( takes the first layout of `layouts` by default.)                                     | `string`                                           | `"base"`                                                                                     |
| layoutLazyImport | whether the route is lazy import                                                                                                             | `(layoutName: string) => boolean`                  | `_name => false`                                                                             |
| transformDir     | the directory of the routes transform function (Converts the route definitions of the generated conventions into routes for the react-router.) | `string`                                           | `"src/router/elegant/transform.ts"`                                                          |
| onRouteMetaGen   | the route meta generator                                                                                                                     | `(routeName: string) => Record<string, string>`    | `routeName => ({ title: routeName })`                                                        |

## Caveat

- Folder naming: can only contain letters, numbers, dash, underscore, and no other special characters

  > The underscore is a cut identifier for the routing hierarchy, and the short horizontal line is used to connect multiple words in a one-level route



## Author

<table>
  <tr>
    <td>
      <img src="https://avatars.githubusercontent.com/u/155351881?v=4" width="100">
    </td>
    <td>
      Ohh<br />
      <span>1509326266@qq.com</span><br />
      <a href="https://github.com/mufeng889">https://github.com/mufeng889</a>
    </td>
  </tr>
</table>  
 
## License

[MIT](https://choosealicense.com/licenses/mit/) 
