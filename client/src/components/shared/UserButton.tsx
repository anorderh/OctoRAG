import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';

export function UserButton({}: ComponentProps) {
    const user = useCurrentUser();
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
                            <span>Username</span>
                        </>
                    )}
                </button>
                {open && (
                    <div
                        style={{ position: 'absolute' }}
                        className="rounded shadow-md bg-card p-2 w-100">
                        <button className="w-100">Logout</button>
                    </div>
                )}
            </div>
        </>
    );
}
