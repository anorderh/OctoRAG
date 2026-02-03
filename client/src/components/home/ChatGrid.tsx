import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { useChatState } from '../../store/chat';
import { ChatCard } from './ChatCard';

export function ChatGrid() {
    const pageSize = 6;
    const [page, setPage] = useState(1);
    const { chats } = useChatState();

    const lower = useMemo(() => (page - 1) * pageSize, [page]);
    const upper = useMemo(() => page * pageSize, [page]);
    const vmChats = useMemo(() => {
        console.log(lower, upper, chats.length);
        return chats.slice(lower, upper);
    }, [chats, lower, upper]);

    function prevPage() {
        if (lower > 0) {
            setPage(page - 1);
        }
    }

    function nextPage() {
        if (upper < chats.length) {
            setPage(page + 1);
        }
    }

    return (
        <div className="d-flex flex-column justify-content-start align-items-center">
            <div className="w-100 d-flex flex-row justify-content-end align-items-center">
                <div className="d-flex flex-row justify-content-center align-items-center gap-2">
                    <button disabled={lower == 0} onClick={prevPage}>
                        <FontAwesomeIcon
                            style={{ width: 30, height: 30 }}
                            icon="fa-solid fa-caret-left"></FontAwesomeIcon>
                    </button>
                    <span className="text-white fw-bold">{page}</span>
                    <button disabled={chats.length <= upper} onClick={nextPage}>
                        <FontAwesomeIcon
                            style={{ width: 30, height: 30 }}
                            icon="fa-solid fa-caret-right"></FontAwesomeIcon>
                    </button>
                </div>
            </div>
            <div
                id="chat-grid"
                className="container rounded p-2 d-flex flex-column justify-content-start align-items-center"
                style={{ height: 470 }}>
                {chats.length == 0 ? (
                    <span className="flex-grow-1 d-flex justify-content-center align-items-center idle-text fst-italic text-muted pb-4 text-center">
                        No chats present
                    </span>
                ) : (
                    <div className="row px-3 w-100">
                        {vmChats.map((chat) => (
                            <div className="col-4 p-2 d-flex">
                                <ChatCard chat={chat}></ChatCard>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
