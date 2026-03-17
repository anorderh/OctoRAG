import octoragLogo from '@/assets/logo/octo-logo.png';
import { Check } from 'lucide-react';

type ChatMessageProps = {
    role: 'user' | 'assistant';
    content: string;
};

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    if (isUser) {
        return (
            <div className="flex justify-end w-full">
                <div
                    className="
                        max-w-[70%]
                        px-4 py-2
                        rounded-full
                        border border-border
                        bg-background
                        text-sm
                    ">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-3">
            {/* AI Content */}
            <div
                className="
                    w-full
                    text-sm
                    leading-relaxed
                    text-foreground
                ">
                {content}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <img
                    src={octoragLogo}
                    alt="logo"
                    className="h-8 w-8 rounded-sm"
                />

                <span>7:09 am, May 5 2025</span>

                <Check className="h-4 w-4" />
            </div>
        </div>
    );
}
