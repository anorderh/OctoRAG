import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Check, Loader2, MessageCircle } from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import { ChatStatus } from '@/shared/constants/chat-status.enums';
import type { RepoChat } from '@/shared/interfaces/RepoChat';

import { useFetchChatsEffect } from '@/hooks/useFetchChatsEffect';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { useEffect } from 'react';

export function SidebarChats() {
    const location = useLocation();

    const { user, authLoading } = useAuthStore((s) => ({
        user: s.user,
        authLoading: s.authLoading,
    }));

    useEffect(() => {
        if (!authLoading && user) {
            useFetchChatsEffect();
        }
    }, [authLoading, user]);

    const chats = useChatStore(
        useShallow((state) =>
            Object.values(state.entities as Record<string, RepoChat>)
                .slice()
                .sort((a, b) => {
                    const aDate = new Date(
                        a.lastMessageDate ?? a.creationDate,
                    ).getTime();
                    const bDate = new Date(
                        b.lastMessageDate ?? b.creationDate,
                    ).getTime();

                    return bDate - aDate;
                }),
        ),
    );

    function renderStatusIcon(status: ChatStatus) {
        switch (status) {
            case ChatStatus.READY:
            case ChatStatus.IDLE:
                return <Check className="h-4 w-4 text-muted-foreground" />;
            default:
                return (
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                );
        }
    }

    return (
        <SidebarGroup className="flex flex-col min-h-0">
            <SidebarGroupLabel className="flex items-center justify-between">
                <span className="flex text-xs font-medium uppercase tracking-wide text-muted-foreground items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Chats
                </span>

                <SidebarMenuBadge className="bg-muted text-xs text-white px-2 py-0.5">
                    {chats.length}
                </SidebarMenuBadge>
            </SidebarGroupLabel>

            <SidebarGroupContent className="flex-1 min-h-0 overflow-y-auto pr-1">
                {chats.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground italic">
                        No chats
                    </div>
                ) : (
                    <SidebarMenu className="space-y-1.5 mt-2">
                        {chats.map((chat) => {
                            const isActive =
                                location.pathname === `/chat/${chat._id}`;

                            return (
                                <SidebarMenuItem key={chat._id}>
                                    <Link to={`/chat/${chat._id}`}>
                                        <SidebarMenuButton
                                            className={`h-11 px-3 text-sm font-medium transition-colors flex items-center justify-between w-full ${
                                                isActive
                                                    ? 'bg-sidebar-accent text-foreground'
                                                    : 'text-foreground/90 hover:text-foreground hover:bg-sidebar-accent'
                                            }`}>
                                            <span className="truncate">
                                                {chat.repoName}
                                            </span>

                                            {renderStatusIcon(chat.status)}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
