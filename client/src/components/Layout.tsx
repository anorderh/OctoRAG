import type { ComponentProps } from '../shared/interfaces/ComponentProps';
import { LoginButton } from './LoginButton';

export function Layout({ children }: ComponentProps) {
    return (
        <div className="w-100 d-flex flex-column justify-content-start align-items-center">
            <div
                id="navbar"
                className="d-flex flex-row justify-content-between my-2"
                style={{
                    height: 60,
                    width: '98%',
                }}>
                <div className="d-flex flex-row justify-content-start align-items-center ms-4">
                    <span>Breadcrumb</span>
                </div>
                <LoginButton />
            </div>
            <div
                id="content"
                className="d-flex flex-column gap-2 justify-content-start align-items-center w-75">
                {children}
            </div>
        </div>
    );
}
