import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useMatches, type UIMatch } from 'react-router';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RouteHandle } from '../Root';

export function Breadcrumb({}: ComponentProps) {
    const matches = useMatches();
    const selectedChat = useSelectedChat();

    const crumbs = matches
        .map((m: UIMatch) => {
            const type = m.handle as RouteHandle;
            switch (type) {
                case 'login':
                    return {
                        icon: 'fa-solid fa-user',
                        display: 'Login',
                    };
                case 'home':
                    return {
                        icon: 'fa-solid fa-house',
                        display: 'Home',
                        to: '/',
                    };
                case 'chat':
                    return {
                        icon: 'fa-solid fa-message',
                        display: `Chat with "${selectedChat?.repoName}"`,
                    };
            }
        })
        .filter((c) => c != null);

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
