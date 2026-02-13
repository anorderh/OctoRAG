import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Breadcrumb } from './Breadcrumb';
import { UserButton } from './UserButton';

export function Navbar() {
    const user = useCurrentUser();
    return (
        <div
            id="navbar"
            className="d-flex flex-row justify-content-between align-items-center py-4"
            style={{
                height: 60,
                width: '98%',
            }}>
            <Breadcrumb></Breadcrumb>
            <div className="me-2">{user != null && <UserButton />}</div>
        </div>
    );
}
