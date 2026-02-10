import { create } from 'zustand';
import type { User } from '../shared/interfaces/User';

export interface UserState {
    currentUser: User | null;
    set: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
    currentUser: null,
    set: (user: User) => set((state) => ({ ...state, currentUser: user })),
}));
