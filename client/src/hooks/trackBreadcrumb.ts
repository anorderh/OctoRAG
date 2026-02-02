import { useEffect } from 'react';
import type { Breadcrumb } from '../shared/interfaces/Breadcrumb';
import { useBreadcrumbStore } from '../store/breadcrumb';

export function useAppliedBreadcrumb(crumb: Breadcrumb) {
    const { add, remove } = useBreadcrumbStore();

    useEffect(() => {
        add(crumb);
        return () => {
            remove(crumb);
        };
    }, []);
}
