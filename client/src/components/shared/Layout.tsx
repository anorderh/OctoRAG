import { Outlet } from 'react-router';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function Layout({ children }: ComponentProps) {
    return (
        <div className="w-100 d-flex flex-column justify-content-start align-items-center">
            <Navbar />
            <div
                id="content"
                className="d-flex flex-column gap-2 justify-content-start align-items-center w-75">
                <Outlet></Outlet>
            </div>
            <Footer />
        </div>
    );
}
