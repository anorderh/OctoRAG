import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';

type Message = {
    id: number | string;
    role: 'user' | 'assistant';
    content: string;
};

type ChatMessagesProps = {
    messages: Message[];
};

export function ChatMessages({ messages }: ChatMessagesProps) {
    return (
        <ScrollArea className="flex-1">
            <div className="px-12 py-6">
                <div className="max-w-3xl mx-auto flex flex-col gap-5">
                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            role={message.role}
                            content={message.content}
                        />
                    ))}
                </div>
            </div>
        </ScrollArea>
    );
}
