/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/alumnos`; params?: Router.UnknownInputParams; } | { pathname: `/botones`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/iniciarsesion`; params?: Router.UnknownInputParams; } | { pathname: `/mesajeria`; params?: Router.UnknownInputParams; } | { pathname: `/recetas`; params?: Router.UnknownInputParams; } | { pathname: `/settings`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/alumnos`; params?: Router.UnknownOutputParams; } | { pathname: `/botones`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/iniciarsesion`; params?: Router.UnknownOutputParams; } | { pathname: `/mesajeria`; params?: Router.UnknownOutputParams; } | { pathname: `/recetas`; params?: Router.UnknownOutputParams; } | { pathname: `/settings`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/alumnos${`?${string}` | `#${string}` | ''}` | `/botones${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/iniciarsesion${`?${string}` | `#${string}` | ''}` | `/mesajeria${`?${string}` | `#${string}` | ''}` | `/recetas${`?${string}` | `#${string}` | ''}` | `/settings${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/alumnos`; params?: Router.UnknownInputParams; } | { pathname: `/botones`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/iniciarsesion`; params?: Router.UnknownInputParams; } | { pathname: `/mesajeria`; params?: Router.UnknownInputParams; } | { pathname: `/recetas`; params?: Router.UnknownInputParams; } | { pathname: `/settings`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
