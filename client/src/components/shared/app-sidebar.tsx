import logo from '@/assets/logo/octo-logo.png';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarUserButton } from './sidebar-user-button';

import { useAuthStore } from '@/store/auth';
import { SidebarChats } from './sidebar-chats';

export function AppSidebar() {
    const authLoading = useAuthStore((s) => s.authLoading);

    return (
        <Sidebar className="bg-card border-r border-border transition-all">
            <SidebarHeader className="flex flex-row items-center justify-between px-4 py-2">
                <img
                    src={logo}
                    alt="OctoRAG"
                    className="h-10 w-10 m-2 object-contain"
                />

                <span className="text-xl font-semibold tracking-tight">
                    OctoRAG
                </span>
            </SidebarHeader>

            {!authLoading && (
                <>
                    <SidebarContent className="px-3">
                        <Link to="/" className="flex items-center">
                            <Button
                                size="lg"
                                className="h-12 w-full bg-primary text-white mb-4">
                                <Plus className="mr-2 h-8 w-8" />
                                Add Github Repository
                            </Button>
                        </Link>
                        <SidebarChats />
                    </SidebarContent>

                    <SidebarFooter className="p-3">
                        <SidebarUserButton />
                    </SidebarFooter>
                </>
            )}
        </Sidebar>
    );
}
