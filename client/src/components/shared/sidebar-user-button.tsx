import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { api } from '@/services/api/api';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthDialog } from './auth-dialog';

export function SidebarUserButton() {
    const user = useCurrentUser();
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();
    const [authOpen, setAuthOpen] = useState(false);

    const isGuest = !user;

    const name = user?.username ?? 'Guest';
    const initial = name.charAt(0).toUpperCase();

    async function handleLogout() {
        try {
            await api.logout();
        } catch {}

        navigate('/');
        useAuthStore.getState().reset();
        useChatStore.getState().reset();
        toast.success('Logged out', {
            icon: <LogOut className="h-4 w-4 text-primary" />,
        });
    }

    function handleLogin() {
        setAuthOpen(true);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="
                        flex w-full items-center gap-3 rounded-md p-2
                        transition-colors
                        hover:bg-sidebar-accent
                        focus:outline-none focus:ring-1 focus:ring-ring
                    ">
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {isGuest ? <User className="h-4 w-4" /> : initial}
                    </div>

                    {/* Text */}
                    <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                            {name}
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
                {isGuest ? (
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                        className="
                            flex items-center gap-2 text-sm cursor-pointer
                            focus:bg-accent
                        ">
                        <LogIn className="h-4 w-4" />
                        Log In
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            handleLogout();
                        }}
                        className="
                            flex items-center gap-2 text-sm cursor-pointer
                            text-destructive
                            focus:bg-destructive/10
                            focus:text-destructive
                        ">
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
            <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
        </DropdownMenu>
    );
}
