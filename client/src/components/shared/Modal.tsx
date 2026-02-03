import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/modal.css';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children?: ReactNode;
};

export function Modal({ open, onClose, children }: ModalProps) {
    const overlayRoot = document.getElementById('overlay-root');
    if (open) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    if (!overlayRoot || !open) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
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
