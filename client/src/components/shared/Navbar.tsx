import { Breadcrumb } from './Breadcrumb';
import { LoginButton } from './LoginButton';

export function Navbar() {
    return (
        <div
            id="navbar"
            className="d-flex flex-row justify-content-between my-2 mb-4"
            style={{
                height: 60,
                width: '98%',
            }}>
            <Breadcrumb></Breadcrumb>
            <LoginButton />
        </div>
    );
}
