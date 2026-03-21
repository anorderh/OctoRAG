import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { useSelectedChat } from '@/hooks/useSelectedChat';
import { useLogStore } from '@/store/log';

export function LogsViewer() {
    const currentChat = useSelectedChat();

    const currentLogs = useLogStore(
        useShallow((state) =>
            Object.values(state.entities).filter(
                (l) => l.chatId === currentChat?._id,
            ),
        ),
    );

    const logs = useMemo(() => {
        return [...currentLogs]
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .map((log) => ({
                id: log._id,
                timestamp: new Date(log.date).toLocaleTimeString(),
                content: log.content,
            }));
    }, [currentLogs]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);

    const isNearBottomRef = useRef(true);

    // Detect Radix viewport + track scroll position
    useEffect(() => {
        if (!containerRef.current) return;

        const viewport = containerRef.current.closest(
            '[data-radix-scroll-area-viewport]',
        ) as HTMLDivElement | null;

        if (!viewport) return;

        viewportRef.current = viewport;

        const handleScroll = () => {
            const threshold = 100;

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

    // Scroll when new logs arrive
    useEffect(() => {
        if (isNearBottomRef.current) {
            bottomRef.current?.scrollIntoView();
        }
    }, [logs.length]);

    // Scroll when content grows (streaming logs)
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
        <ScrollArea className="p-4 border bg-black rounded-lg h-[60vh] overflow-hidden">
            <div ref={containerRef} className="p-4 flex flex-col gap-6">
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <span className="text-xs text-muted-foreground italic">
                            No logs yet
                        </span>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">
                                {log.timestamp}
                            </p>

                            <p
                                className="text-sm leading-relaxed text-foreground"
                                style={{
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                }}>
                                {log.content}
                            </p>
                        </div>
                    ))
                )}

                <div ref={bottomRef} />
            </div>

            <ScrollBar orientation="vertical" />
        </ScrollArea>
    );
}
