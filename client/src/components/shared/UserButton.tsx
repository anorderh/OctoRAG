import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { api } from '../../services/api/api';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { useAuthStore } from '../../store/auth';

export function UserButton({}: ComponentProps) {
    const user = useCurrentUser();
    const logout = useAuthStore((state) => state.logout);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle click outside.
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function confirmLogout() {
        await api.logout();
        logout();
    }

    const disabled = () => user == null;

    return (
        <>
            <div
                ref={containerRef}
                style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    disabled={disabled()}
                    onClick={() => setOpen(!open)}
                    id="UserButton"
                    className="solid-button">
                    {disabled() ? (
                        <>
                            <span className="fst-italic">Invalid user</span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon
                                icon="fa-solid fa-user"
                                className="me-2"
                            />
                            <span>{user?.username}</span>
                        </>
                    )}
                </button>
                {open && (
                    <div
                        style={{ position: 'absolute' }}
                        className="align-items-center rounded shadow-md bg-card p-2 w-100">
                        <button
                            onClick={confirmLogout}
                            className="w-100 d-flex flex-row justify-content-center align-items-center ">
                            <FontAwesomeIcon
                                icon="fa-solid fa-arrow-right-from-bracket"
                                className="me-2"
                            />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
