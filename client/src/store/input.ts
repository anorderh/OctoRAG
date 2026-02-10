import { create } from 'zustand';

export interface InputState {
    message: string;
    setMessage: (input: string) => void;
}

export const useInputStore = create<InputState>((set) => ({
    message: '',
    setMessage: (input: string) => {
        set((state) => ({ ...state, message: input }));
    },
}));
