import { create } from 'zustand';

export interface ModalState {
    opened: boolean;
    open: () => void;
    close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    opened: false,
    open: () => set(() => ({ opened: true })),
    close: () => set(() => ({ opened: false })),
}));
