import { ChatMessages } from '@/components/chat/chat-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useParams } from 'react-router-dom';

export function ChatPage() {
    const { id } = useParams();

    const messages = [
        {
            id: 1,
            role: 'user',
            content: 'What can you tell me about the aliens vs predator movie?',
        },
        {
            id: 2,
            role: 'assistant',
            content:
                'The Alien vs. Predator (AVP) concept is basically a crossover mythos where two iconic sci-fi species collide...',
        },
    ];

    return (
        <div className="h-full flex flex-col">
            <ChatMessages messages={messages} />

            <div className="p-4 mb-8 mx-8">
                <div className="relative max-w-3xl mx-auto">
                    <Input
                        placeholder="Provide a prompt..."
                        className="
                            h-12
                            rounded-full
                            pl-5
                            pr-14
                            bg-card
                            border-border
                            text-sm
                            placeholder:text-muted-foreground
                            focus-visible:ring-1
                            focus-visible:ring-primary
                        "
                    />

                    <Button
                        size="icon"
                        className="
                            absolute right-1 top-1/2
                            -translate-y-1/2
                            active:translate-y-[-50%]
                            h-9 w-9
                            rounded-full
                            bg-primary
                            hover:bg-primary/90
                        ">
                        <Send className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
