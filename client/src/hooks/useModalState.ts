import { useState } from 'react';

export function useModalState() {
    const [modalState, setModalState] = useState(false);
    const open = () => setModalState(true);
    const close = () => setModalState(false);

    return {
        open,
        close,
        opened: modalState,
    };
}
