import { create } from 'zustand';
import type { User } from '../shared/interfaces/User';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    setUser: (user: User) => void;
    setAccessToken: (access: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    setUser: (user: User) => set((state) => ({ ...state, user })),
    setAccessToken: (accessToken: string) =>
        set((state) => ({ ...state, accessToken })),
    logout: () =>
        set({
            user: null,
            accessToken: null,
        }),
}));
