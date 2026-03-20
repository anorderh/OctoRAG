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
import { TooltipProvider } from './ui/tooltip';

export const Layout = () => {
    useAuthBootstrap();
    const location = useLocation();
    const isChatPage = location.pathname.startsWith('/chat');
    return (
        <>
            {' '}
            <TooltipProvider>
                <SidebarProvider>
                    <AppSidebar />

                    <SidebarInset className="bg-background text-foreground flex flex-col h-screen">
                        {/* Header */}
                        <header className="sticky top-0 z-20 flex h-14 items-center justify-between ps-4 bg-background">
                            <SidebarTrigger className="mb-1" />

                            {isChatPage && (
                                <div className="flex-1 flex justify-center">
                                    <ChatHeader />
                                </div>
                            )}
                        </header>

                        {/* Page content */}
                        <div className="flex-1 min-h-0">
                            <Outlet />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
            <Toaster position="bottom-right" />
        </>
    );
};
