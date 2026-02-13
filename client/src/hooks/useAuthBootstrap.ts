import { useEffect } from 'react';
import { api } from '../services/api/api';
import { useAuthStore } from '../store/auth';

export function useAuthBootstrap() {
    const authStore = useAuthStore();
    useEffect(() => {
        const bootstrap = async () => {
            try {
                const accessToken = await api.refresh();
                authStore.setAccessToken(accessToken);
                const [selfUser] = await Promise.all([
                    api.getSelf(),
                    new Promise((resolve) => setTimeout(resolve, 1000)),
                ]);
                authStore.setUser(selfUser);
            } catch {
                authStore.setUser(null);
            } finally {
                authStore.setLoading(false);
            }
        };
        bootstrap();
    }, []);
}
