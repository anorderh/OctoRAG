import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Navigate, Outlet } from 'react-router';
import { Modal } from '../components/shared/Modal';
import { useAuthStore } from '../store/auth';

export function AuthGuard() {
    const { user, authLoading } = useAuthStore();

    if (authLoading) {
        return (
            <Modal opened={true}>
                <div className="d-flex flex-column justify-content-center align-items-center gap-2 p-2">
                    <h5>Refreshing auth...</h5>
                    <FontAwesomeIcon
                        icon="fa-solid fa-spinner"
                        className="fa-spin fs-5"
                    />
                </div>
            </Modal>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
