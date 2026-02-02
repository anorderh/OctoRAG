import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { useBreadcrumbStore } from '../../store/breadcrumb';

export function Breadcrumb({}: ComponentProps) {
    const { crumbs } = useBreadcrumbStore();

    return (
        <div className="d-flex flex-row justify-content-start align-items-center ms-4 fst-italic">
            {crumbs.map((crumb, idx) => (
                <span
                    key={idx}
                    className="d-inline-flex align-items-center me-2">
                    {idx !== 0 && (
                        <FontAwesomeIcon
                            icon="fa-solid fa-caret-right"
                            className="me-2"
                        />
                    )}
                    {crumb.icon && (
                        <FontAwesomeIcon icon={crumb.icon} className="me-2" />
                    )}

                    {/* Crumb label */}
                    <span>{crumb.display}</span>
                </span>
            ))}
        </div>
    );
}
