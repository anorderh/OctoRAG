import type { UIMatch } from 'react-router';

export interface Breadcrumb {
    icon?: string;
    display: string;
    to?: string;
}

export type RouteHandle = (m: UIMatch) => Breadcrumb;
