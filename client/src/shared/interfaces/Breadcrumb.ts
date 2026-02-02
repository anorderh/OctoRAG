import type { BreadcrumbId } from '../constants/breadcrumb-id';

export interface Breadcrumb {
    icon?: string;
    id: BreadcrumbId;
    display: string;
}
