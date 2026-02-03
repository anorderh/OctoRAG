import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useMatches } from 'react-router';
import type { RouteHandle } from '../../shared/interfaces/Breadcrumb';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';

export function Breadcrumb({}: ComponentProps) {
    const matches = useMatches();
    const crumbs = matches
        .map((m) => {
            let handle = m.handle as RouteHandle;
            return handle ? handle(m.params) : null;
        })
        .filter((c) => c != null);

    console.log(crumbs);

    return (
        <div className="d-flex flex-row justify-content-start align-items-center ms-4 fst-italic py-4">
            {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                    <span
                        key={idx}
                        className="d-inline-flex align-items-center me-2">
                        {/* Separator */}
                        {idx !== 0 && (
                            <FontAwesomeIcon
                                icon="fa-solid fa-caret-right"
                                className="me-2"
                            />
                        )}

                        {/* Optional icon */}
                        {crumb.icon && (
                            <FontAwesomeIcon
                                icon={crumb.icon}
                                className="me-2"
                            />
                        )}

                        {/* Label */}
                        {crumb.to && !isLast ? (
                            <Link
                                to={crumb.to}
                                className="text-white text-underline-none breadcrumb-link">
                                {crumb.display}
                            </Link>
                        ) : (
                            <span aria-current="page">{crumb.display}</span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}
