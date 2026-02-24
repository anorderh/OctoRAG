import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import { useLogStore } from '../../store/log';

export function ChatActionLog() {
    const currentChat = useSelectedChat();

    // Render logs.
    const currentLogs = useLogStore(
        useShallow((state) =>
            Object.values(state.entities).filter(
                (l) => l.chatId == currentChat?._id,
            ),
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
                fontSize: '14px',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                overscrollBehavior: 'contain',
            }}
            id="repoLogs"
            className="flex-grow-1 overflow-auto w-100 d-flex flex-column info-card rounded-3 p-3 shadow-ld bg-black gap-4">
            {outputLogs.length === 0 ? (
                <span className="text-muted fst-italic">No logs yet</span>
            ) : (
                outputLogs.map((log) => (
                    <div
                        key={log._id}
                        className="d-flex flex-column gap-1 text-white">
                        <span className="text-muted small">
                            {new Date(log.date).toLocaleTimeString()}
                        </span>

                        <span
                            style={{
                                fontFamily: 'monospace',
                                lineHeight: 1.4,
                            }}>
                            {log.content}
                        </span>
                    </div>
                ))
            )}
        </div>
    );
}
