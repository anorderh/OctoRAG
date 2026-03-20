import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { ScrollArea } from '@/components/ui/scroll-area';

import { useSelectedChat } from '../../hooks/useSelectedChat';
import { useMessageStore } from '../../store/messages';

import { ChatInput } from './chat-input';
import { ChatLoadingIndicator } from './chat-loading-indicator';
import { ChatResponse } from './chat-response';

export function ChatMessages() {
    const currentChat = useSelectedChat();

    const messages = useMessageStore(
        useShallow((state) =>
            Object.values(state.entities)
                .filter((m) => m.chatId === currentChat?._id)
                .sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                ),
        ),
    );

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    return (
        <ScrollArea className="flex-1">
            <div className="px-12 py-6">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                    {messages.length === 0 ? (
                        <div className="h-[60vh] flex items-center justify-center">
                            <ChatLoadingIndicator
                                status={currentChat?.status!}
                            />
                        </div>
                    ) : (
                        messages.map((message) =>
                            message.source === 'ai' ? (
                                <ChatResponse
                                    key={message._id}
                                    message={message}
                                />
                            ) : (
                                <ChatInput
                                    key={message._id}
                                    message={message}
                                />
                            ),
                        )
                    )}

                    <div ref={bottomRef} />
                </div>
            </div>
        </ScrollArea>
    );
}
