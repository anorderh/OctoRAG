import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { ScrollArea } from '@/components/ui/scroll-area';

import { useSelectedChat } from '../../hooks/useSelectedChat';
import { useMessageStore } from '../../store/messages';

import { ChatStatus } from '@/shared/constants/chat-status.enums';
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
    const containerRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);

    const isNearBottomRef = useRef(true);

    // Detect viewport (Radix ScrollArea viewport)
    useEffect(() => {
        if (!containerRef.current) return;

        const viewport = containerRef.current.closest(
            '[data-radix-scroll-area-viewport]',
        ) as HTMLDivElement | null;

        if (!viewport) return;

        viewportRef.current = viewport;

        const handleScroll = () => {
            const threshold = 100; // px buffer
            const distanceFromBottom =
                viewport.scrollHeight -
                viewport.scrollTop -
                viewport.clientHeight;

            isNearBottomRef.current = distanceFromBottom < threshold;
        };

        viewport.addEventListener('scroll', handleScroll);

        return () => {
            viewport.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Scroll when new messages arrive
    useEffect(() => {
        if (isNearBottomRef.current) {
            bottomRef.current?.scrollIntoView();
        }
    }, [messages.length]);

    // Scroll when content grows (streaming)
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            if (isNearBottomRef.current) {
                bottomRef.current?.scrollIntoView();
            }
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <ScrollArea className="flex-1 h-full">
            <div ref={containerRef} className="px-12 py-6">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                    {messages.length === 0 ? (
                        <div className="h-[60vh] flex items-start justify-start">
                            <ChatLoadingIndicator
                                status={currentChat?.status!}
                            />
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isLast = index === messages.length - 1;

                            if (message.source === 'ai') {
                                return (
                                    <ChatResponse
                                        key={message._id}
                                        message={message}
                                        status={
                                            isLast
                                                ? currentChat!.status
                                                : ChatStatus.READY
                                        }
                                    />
                                );
                            }

                            return (
                                <ChatInput
                                    key={message._id}
                                    message={message}
                                />
                            );
                        })
                    )}

                    <div ref={bottomRef} />
                </div>
            </div>
        </ScrollArea>
    );
}
