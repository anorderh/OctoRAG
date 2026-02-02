import { create } from 'zustand';
import type { Breadcrumb } from '../shared/interfaces/Breadcrumb';

export interface BreadcrumbState {
    crumbs: Breadcrumb[];
    add: (crumb: Breadcrumb) => void;
    remove: (crumb: Breadcrumb) => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set, remove) => ({
    crumbs: [],
    add: (crumb: Breadcrumb) =>
        set((state) => ({ ...state, crumbs: state.crumbs.concat([crumb]) })),
    remove: (crumb: Breadcrumb) =>
        set((state) => {
            let crumbs = state.crumbs;
            crumbs = crumbs.filter((c) => c.id != crumb.id);
            return {
                ...state,
                crumbs,
            };
        }),
}));
