import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/modal.css';

export type ModalComponentProps = {
    opened: boolean;
    close?: () => void;
    children?: ReactNode;
};

export function Modal({ opened, close, children }: ModalComponentProps) {
    // Disable scrolling outside modal.
    useEffect(() => {
        if (opened) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [opened]);

    const overlayRoot = document.getElementById('overlay-root');
    if (!overlayRoot || !opened) return null;
    return createPortal(
        <div className="modal-overlay" onClick={close}>
            <div
                className="modal-custom shadow rounded w-auto h-auto p-2"
                style={{
                    minHeight: 40,
                    minWidth: 40,
                    backgroundColor: 'var(--color-card)',
                }}
                onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        overlayRoot,
    );
}
