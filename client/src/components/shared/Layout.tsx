import { Outlet } from 'react-router';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function Layout({ children }: ComponentProps) {
    return (
        <div className="w-100 h-100 d-flex flex-column justify-content-start align-items-center">
            <Navbar />
            <div
                id="content"
                // style={{ height: '100%' }}
                className="d-flex flex-column flex-grow-1 gap-2 justify-content-start align-items-center">
                <Outlet></Outlet>
            </div>
            <Footer />
        </div>
    );
}
