import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

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

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [logs.length]);

    return (
        <div
            ref={containerRef}
            className="
                border
                bg-black
                rounded-lg
                h-[60vh]
                overflow-y-auto
                pr-2
                p-4
            ">
            {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground italic">
                        No logs yet
                    </span>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {logs.map((log) => (
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
                    ))}
                </div>
            )}
        </div>
    );
}
