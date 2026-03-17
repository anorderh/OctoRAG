import { AppSidebar } from '@/components/shared/app-sidebar.tsx';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';

export const Layout = () => {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="bg-background text-foreground">
                {/* Header */}
                <header className="flex h-14 items-center border-b border-border px-4">
                    <SidebarTrigger />
                    <h1 className="ml-4 text-sm text-muted">OctoRAG</h1>
                </header>

                {/* Main content */}
                <main className="p-4">Your content here</main>
            </SidebarInset>
        </SidebarProvider>
    );
};
