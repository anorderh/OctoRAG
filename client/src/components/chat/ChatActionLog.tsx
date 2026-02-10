import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import { useLogStore } from '../../store/log';

export function ChatActionLog() {
    const currentChat = useSelectedChat();

    // Render logs.
    const currentLogs = useLogStore(
        useShallow((state) =>
            state.logs.filter((l) => l.chatId == currentChat?.id),
        ),
    );
    const outputLogs = useMemo(() => {
        const temp = [...currentLogs];
        return temp.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }, [currentLogs]);

    // Ensure log is scrolled to bottom.
    const chatParent = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const domNode = chatParent.current;
        if (domNode) {
            domNode.scrollTop = domNode.scrollHeight;
        }
    }, [outputLogs.length, chatParent]);

    return (
        <div
            ref={chatParent}
            style={{
                height: '600px',
                fontSize: '14px',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                overscrollBehavior: 'contain',
            }}
            id="repoLogs"
            className="overflow-auto w-100 d-flex flex-column info-card rounded-3 p-3 shadow-ld bg-black gap-4">
            {outputLogs.length == 0 ? (
                <span className="text-muted text-wrap fst-italic">
                    No logs yet
                </span>
            ) : (
                <>
                    {outputLogs.map((log) => (
                        <span
                            key={log.id}
                            className="text-white text-wrap d-flex flex-row gap-2">
                            <span className="text-muted small mb-1 text-nowrap">
                                {log.date}
                            </span>

                            <span>{log.content}</span>
                        </span>
                    ))}
                </>
            )}
        </div>
    );
}
