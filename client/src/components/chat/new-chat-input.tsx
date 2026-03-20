import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api/api';
import type { RepoChat, RepoChatPost } from '@/shared/interfaces/RepoChat';
import { useChatStore } from '@/store/chat';
import { Github, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

type FormValues = {
    url: string;
};

export function NewChatInput() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormValues>();

    const { create } = useChatStore();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    async function handleFormSubmit(data: FormValues) {
        try {
            setSubmitting(true);
            const post: RepoChatPost = {
                repoUrl: data.url.trim(),
            };

            const chat: RepoChat = await create(post);
            api.runChatScrape({ chatId: chat._id });
            navigate(`/chat/${chat._id}`);
        } catch (err) {
            setError('root', {
                type: 'server',
                message: 'Something went wrong. Try again.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
            <div className="relative w-full">
                <Input
                    disabled={submitting}
                    placeholder="Paste a GitHub repository URL"
                    {...register('url', {
                        required: 'A repository URL is required',
                        pattern: {
                            value: /^https?:\/\/(www\.)?github\.com\/[^\/\s]+\/[^\/\s]+\/?$/i,
                            message: 'Must be a valid GitHub repository URL',
                        },
                    })}
                    className="
                        p-4
                        h-12
                        rounded-full
                        pr-14
                        bg-card
                        border-border
                        text-md
                        placeholder:text-muted-foreground
                        focus-visible:ring-1
                        focus-visible:ring-primary
                    "
                />

                <Button
                    type="submit"
                    size="icon"
                    disabled={submitting}
                    className="
                        absolute right-1 top-1/2
                        -translate-y-1/2
                        h-9 w-9
                        rounded-full
                        bg-primary
                        hover:bg-primary/90
                    ">
                    {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                        <Github className="h-4 w-4 text-white" />
                    )}
                </Button>
            </div>

            {errors.url && (
                <p className="mt-2 text-sm text-red-500 text-center">
                    {errors.url.message}
                </p>
            )}

            {errors.root && (
                <p className="mt-2 text-sm text-red-500 text-center">
                    {errors.root.message}
                </p>
            )}
        </form>
    );
}
