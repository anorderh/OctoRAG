import { create } from 'zustand';
import type { User } from '../shared/interfaces/User';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    authLoading: boolean;
    setUser: (user: User | null) => void;
    setAccessToken: (access: string) => void;
    setLoading: (authLoading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    authLoading: true,
    setUser: (user: User | null) =>
        set((state) => {
            if (user == null) {
                return { ...state, user };
            } else {
                return { ...state, user };
            }
        }),
    setAccessToken: (accessToken: string) =>
        set((state) => ({ ...state, accessToken })),
    setLoading: (authLoading: boolean) =>
        set((state) => ({ ...state, authLoading })),
    logout: () =>
        set({
            user: null,
            accessToken: null,
        }),
}));
