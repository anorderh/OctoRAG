import { Breadcrumb } from './Breadcrumb';
import { LoginButton } from './LoginButton';

export function Navbar() {
    return (
        <div
            id="navbar"
            className="d-flex flex-row justify-content-between align-items-center py-4 mb-2"
            style={{
                height: 60,
                width: '98%',
            }}>
            <Breadcrumb></Breadcrumb>
            <div className="me-2">
                <LoginButton />
            </div>
        </div>
    );
}
