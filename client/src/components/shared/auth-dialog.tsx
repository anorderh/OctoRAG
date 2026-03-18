import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { api } from '@/services/api/api';
import { useAuthStore } from '@/store/auth';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type AuthDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type LoginForm = {
    username: string;
    password: string;
};

type RegisterForm = {
    username: string;
    email: string;
    password: string;
};

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [submitting, setSubmitting] = useState(false);

    const authStore = useAuthStore();

    const loginForm = useForm<LoginForm>();
    const registerForm = useForm<RegisterForm>();

    async function handleLogin(data: LoginForm) {
        try {
            setSubmitting(true);

            const accessToken = await api.login(data);
            authStore.setAccessToken(accessToken);

            const user = await api.getSelf();
            authStore.setUser(user);

            toast.success('Logged in successfully');
            onOpenChange(false);
        } catch {
            loginForm.setError('root', {
                message: 'Invalid username or password',
            });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRegister(data: RegisterForm) {
        try {
            setSubmitting(true);

            await api.register(data);

            toast.success('Account created. Please log in.');
            setTab('login');
        } catch {
            registerForm.setError('root', {
                message: 'Registration failed',
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-lg font-semibold tracking-tight">
                        Welcome to OctoRAG
                    </DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="px-6">
                    <Tabs
                        value={tab}
                        onValueChange={(v) => setTab(v as any)}
                        className="w-full">
                        <TabsList className="grid grid-cols-2 w-full bg-muted/40 p-1 rounded-md">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        {/* LOGIN */}
                        <TabsContent value="login">
                            <form
                                onSubmit={loginForm.handleSubmit(handleLogin)}
                                className="flex flex-col gap-4 mt-6">
                                <div className="flex flex-col gap-2">
                                    <Label>Username</Label>
                                    <Input
                                        disabled={submitting}
                                        placeholder="Enter username"
                                        className="bg-card"
                                        {...loginForm.register('username', {
                                            required: 'Username is required',
                                        })}
                                    />
                                    {loginForm.formState.errors.username && (
                                        <p className="text-xs text-destructive">
                                            {
                                                loginForm.formState.errors
                                                    .username.message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        disabled={submitting}
                                        placeholder="Enter password"
                                        className="bg-card"
                                        {...loginForm.register('password', {
                                            required: 'Password is required',
                                        })}
                                    />
                                    {loginForm.formState.errors.password && (
                                        <p className="text-xs text-destructive">
                                            {
                                                loginForm.formState.errors
                                                    .password.message
                                            }
                                        </p>
                                    )}
                                </div>

                                {loginForm.formState.errors.root && (
                                    <p className="text-sm text-destructive text-center">
                                        {
                                            loginForm.formState.errors.root
                                                .message
                                        }
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-2">
                                    {submitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Login
                                </Button>
                            </form>
                        </TabsContent>

                        {/* REGISTER */}
                        <TabsContent value="register">
                            <form
                                onSubmit={registerForm.handleSubmit(
                                    handleRegister,
                                )}
                                className="flex flex-col gap-4 mt-6">
                                <div className="flex flex-col gap-2">
                                    <Label>Username</Label>
                                    <Input
                                        disabled={submitting}
                                        placeholder="Enter username"
                                        className="bg-card"
                                        {...registerForm.register('username', {
                                            required: 'Username is required',
                                        })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        disabled={submitting}
                                        placeholder="Enter email"
                                        className="bg-card"
                                        {...registerForm.register('email', {
                                            required: 'Email is required',
                                        })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        disabled={submitting}
                                        placeholder="Enter password"
                                        className="bg-card"
                                        {...registerForm.register('password', {
                                            required: 'Password is required',
                                        })}
                                    />
                                </div>

                                {registerForm.formState.errors.root && (
                                    <p className="text-sm text-destructive text-center">
                                        {
                                            registerForm.formState.errors.root
                                                .message
                                        }
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-2">
                                    {submitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Register
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer spacing */}
                <div className="h-4" />
            </DialogContent>
        </Dialog>
    );
}
