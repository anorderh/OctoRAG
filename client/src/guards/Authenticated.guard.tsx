import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../store/auth';

export function AuthenticatedGuard() {
    const user = useAuthStore((s) => s.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
