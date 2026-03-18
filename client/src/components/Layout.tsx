import { AppSidebar } from '@/components/shared/app-sidebar.tsx';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { Outlet, useLocation } from 'react-router-dom';
import { ChatHeader } from './chat/chat-header';
import { Toaster } from './ui/sonner';

export const Layout = () => {
    useAuthBootstrap();
    const location = useLocation();
    const isChatPage = location.pathname.startsWith('/chat');
    return (
        <>
            <SidebarProvider>
                <AppSidebar />

                <SidebarInset className="bg-background text-foreground flex flex-col">
                    {/* Unified Header */}
                    <header className="flex h-14 items-center justify-between ps-4">
                        <SidebarTrigger className="mb-1" />

                        {/* Inject page-specific header */}
                        {isChatPage && (
                            <div className="flex-1 flex justify-center">
                                <ChatHeader title="Chat Template" />
                            </div>
                        )}
                    </header>

                    <div className="flex-1 overflow-hidden">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
            <Toaster position="bottom-right" />
        </>
    );
};
