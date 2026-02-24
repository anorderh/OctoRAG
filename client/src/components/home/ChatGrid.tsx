import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFetchChatsEffect } from '../../hooks/useFetchChatsEffect';
import { useModalState } from '../../hooks/useModalState';
import { useChatStore } from '../../store/chat';
import { ChatCard } from './ChatCard';
import { CreateChatModal } from './CreateChatModal';

export function ChatGrid() {
    // Effects.
    useFetchChatsEffect();

    // Data.
    const chats = useChatStore(
        useShallow((state) => Object.values(state.entities)),
    );

    // Handle pagination.
    const pageSize = 6;
    const [page, setPage] = useState(1);
    const lower = useMemo(() => (page - 1) * pageSize, [page]);
    const upper = useMemo(() => page * pageSize, [page]);
    const vmChats = useMemo(() => {
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

    // Handle create button.
    const {
        open: openCreateModal,
        close: closeCreateModal,
        opened: openedCreateModal,
    } = useModalState();

    return (
        <div className="d-flex flex-column justify-content-start align-items-center">
            <div className="w-100 d-flex flex-row justify-content-end align-items-center">
                <button
                    onClick={openCreateModal}
                    className="solid-button bg-primary">
                    <FontAwesomeIcon
                        className="me-2"
                        icon="fa-solid fa-plus"></FontAwesomeIcon>
                    <span>Create Chat</span>
                </button>
                <CreateChatModal
                    close={closeCreateModal}
                    opened={openedCreateModal}></CreateChatModal>
            </div>
            <div
                id="chat-grid"
                className="container overflow-auto rounded p-2 d-flex flex-column justify-content-start align-items-center"
                style={{ minHeight: 470 }}>
                {chats.length == 0 ? (
                    <span className="flex-grow-1 d-flex justify-content-center align-items-center idle-text fst-italic text-muted pb-4 text-center">
                        No chats present
                    </span>
                ) : (
                    <div className="row px-3 w-100">
                        {vmChats.map((chat, idx) => (
                            <div
                                key={idx}
                                className="col-lg-4 col-md-6 p-2 d-flex">
                                <ChatCard chat={chat}></ChatCard>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
        </div>
    );
}
