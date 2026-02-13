import { useAuthStore } from '../store/auth';

export function useCurrentUser() {
    return useAuthStore((state) => state.user);
}
