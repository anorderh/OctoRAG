import logo from '@/assets/logo/octo-logo.png';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import { Check, Loader2, MessageCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarUserButton } from './sidebar-user-button';

const CHAT_TEMPLATES = [
    { name: 'Chat Template 1', isProcessing: true },
    { name: 'Chat Template 2', isProcessing: false },
    { name: 'Chat Template 3', isProcessing: false },
];

import { useAuthStore } from '@/store/auth';

export function AppSidebar() {
    const authLoading = useAuthStore((s) => s.authLoading);

    return (
        <Sidebar className="bg-card border-r border-border transition-all">
            {/* HEADER (always visible) */}
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

            {/* CONTENT (hide while loading) */}
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

                        <SidebarGroup>
                            <SidebarGroupLabel className="flex items-center justify-between">
                                <span className="flex text-xs font-medium uppercase tracking-wide text-muted-foreground items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Chats
                                </span>

                                <SidebarMenuBadge className="bg-muted text-xs text-white px-2 py-0.5">
                                    {CHAT_TEMPLATES.length}
                                </SidebarMenuBadge>
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <SidebarMenu className="space-y-1.5 mt-2">
                                    {CHAT_TEMPLATES.map((chat, index) => (
                                        <SidebarMenuItem key={chat.name}>
                                            <Link to={`/chat/${index + 1}`}>
                                                <SidebarMenuButton className="h-11 px-3 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between w-full">
                                                    <span className="truncate">
                                                        {chat.name}
                                                    </span>

                                                    {chat.isProcessing ? (
                                                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-3">
                        <SidebarUserButton />
                    </SidebarFooter>
                </>
            )}
        </Sidebar>
    );
}
