import logo from '@/assets/logo/octo-logo.png';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    Check,
    Loader2,
    LogOut,
    MessageCircle,
    Plus,
    Settings,
} from 'lucide-react';

const CHAT_TEMPLATES = [
    { name: 'Chat Template 1', isProcessing: true },
    { name: 'Chat Template 2', isProcessing: false },
    { name: 'Chat Template 3', isProcessing: false },
];

export function AppSidebar() {
    return (
        <Sidebar className="bg-card border-r border-border transition-all">
            {/* HEADER */}
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

            {/* CONTENT */}
            <SidebarContent className="px-3">
                {/* CTA */}
                <Button
                    size="lg"
                    className="h-12 cursor-pointer w-full bg-primary text-white mb-4">
                    <Plus className="mr-2 h-8 w-8" />
                    Add Github Repository
                </Button>

                {/* CHATS */}
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
                                    <SidebarMenuButton className="h-11 px-3 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between">
                                        {/* Left: text */}
                                        <span className="truncate">
                                            {chat.name}
                                        </span>
                                        {/* Right: status icon */}
                                        {chat.isProcessing ? (
                                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="
                    flex w-full items-center gap-3 rounded-md p-2
                    transition-colors
                    hover:bg-sidebar-accent
                    focus:outline-none focus:ring-1 focus:ring-ring
                ">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                U
                            </div>

                            <div className="text-left">
                                <p className="text-sm font-medium text-foreground">
                                    Username
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    username@email.com
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="
                bg-popover
                border border-border
                text-popover-foreground
                shadow-md
            ">
                        <DropdownMenuItem
                            className="
                    flex items-center gap-2 text-sm cursor-pointer
                    focus:bg-accent focus:text-accent-foreground
                ">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            Settings
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border" />

                        <DropdownMenuItem
                            className="
                    flex items-center gap-2 text-sm cursor-pointer
                    text-destructive
                    focus:bg-destructive/10
                    focus:text-destructive
                ">
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
