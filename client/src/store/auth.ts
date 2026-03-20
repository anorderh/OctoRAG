import { create } from 'zustand';
import type { User } from '../shared/interfaces/User';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    authLoading: boolean;

    setUser: (user: User | null) => void;
    setAccessToken: (access: string | null) => void;
    setLoading: (authLoading: boolean) => void;

    logout: () => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    accessToken: null,
    authLoading: true,

    setUser: (user) => set({ user }),
    setAccessToken: (accessToken) => set({ accessToken }),
    setLoading: (authLoading) => set({ authLoading }),

    logout: () =>
        set({
            user: null,
            accessToken: null,
        }),

    reset: () =>
        set({
            user: null,
            accessToken: null,
            authLoading: false,
        }),
}));
