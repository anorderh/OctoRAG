import type { Params } from 'react-router';

export interface Breadcrumb {
    icon?: string;
    display: string;
    to?: string;
}

export type RouteHandle =
    | (() => Breadcrumb)
    | ((params: Params<string>) => Breadcrumb);
