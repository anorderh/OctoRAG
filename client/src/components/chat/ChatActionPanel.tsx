import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { useModalState } from '../../hooks/useModalState';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import { api } from '../../services/api/api';
import { ChatStatus } from '../../shared/constants/chat-status.enums';
import { useChatStore } from '../../store/chat';
import { selectMessagesForChat, useMessageStore } from '../../store/messages';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { Modal } from '../shared/Modal';
import { ChatActionLog } from './ChatActionLog';

export function ChatActionPanel() {
    const currentChat = useSelectedChat()!;
    const currentMessages = useMessageStore(
        useShallow(selectMessagesForChat(currentChat._id ?? '')),
    );
    const deleteChat = useChatStore((s) => s.delete);
    const navigate = useNavigate();

    // State.
    const {
        open: openDeleteModal,
        close: closeDeleteModal,
        opened: openedDeleteModal,
    } = useModalState();
    const {
        open: openInfoModal,
        close: closeInfoModal,
        opened: openedInfoModal,
    } = useModalState();
    const {
        open: openRerunModal,
        close: closeRerunModal,
        opened: openedRerunModal,
    } = useModalState();

    // Actions.
    function attemptDelete() {
        openDeleteModal();
    }
    async function submitDelete() {
        const chatId = currentChat?._id;
        if (chatId != null) {
            await deleteChat(chatId);
            navigate('/');
        }
    }
    function runScrape() {
        api.runChatScrape({ chatId: currentChat!._id });
    }

    const hasMessages = () => currentMessages.length > 0;

    const isLoading = () => currentChat?.status == ChatStatus.LOADING;
    const isResponding = () => currentChat?.status == ChatStatus.RESPONDING;
    return (
        <div className="d-flex flex-column gap-3 w-50 ">
            <div className="d-flex flex-row gap-2 justify-content-between align-items-center w-100">
                <div className="d-flex flex-row align-items-center gap-1">
                    <span className="ms-2 mb-1 fs-4 fw-bold">Logs</span>
                    {currentChat?.status == ChatStatus.LOADING && (
                        <FontAwesomeIcon
                            className="fa-spin fs-4"
                            icon={
                                'fa-solid fa-spinner fa-spin'
                            }></FontAwesomeIcon>
                    )}
                </div>
                <ChatStatusBadge status={currentChat!.status} />
            </div>
            <ChatActionLog />
            <div className="d-flex flex-row gap-2 flex-wrap justify-content-start">
                <button
                    onClick={openRerunModal}
                    disabled={isLoading() || isResponding()}
                    className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-play"></FontAwesomeIcon>
                    <span>Run scrape</span>
                </button>
                <button
                    onClick={openInfoModal}
                    className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-info"></FontAwesomeIcon>
                    <span>Info</span>
                </button>
                <button
                    onClick={attemptDelete}
                    className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-trash"></FontAwesomeIcon>
                    <span>Delete chat</span>
                </button>
            </div>
            <ConfirmationModal
                key="deleteChatsModal"
                callback={submitDelete}
                opened={openedDeleteModal}
                close={closeDeleteModal}
                heading={'Delete Confirmation'}
                body={`Would you like to delete Chat "${currentChat?.repoName}"?`}
            />
            <ConfirmationModal
                key="rerunScrapeModal"
                callback={runScrape}
                opened={openedRerunModal}
                close={closeRerunModal}
                heading={'Run Scrape Confirmation'}
                body={`Would you like to run RAG scrape for Chat "${currentChat?.repoName}"?`}
            />
            <Modal opened={openedInfoModal} close={closeInfoModal}>
                <div className="d-flex flex-column gap-2 p-3">
                    <h2 className="mb-2">Repo Chat Info</h2>

                    <div>
                        <strong>ID:</strong> {currentChat._id}
                    </div>
                    <div>
                        <strong>User ID:</strong> {currentChat.userId}
                    </div>
                    <div>
                        <strong>Repository Name:</strong> {currentChat.repoName}
                    </div>
                    <div>
                        <strong>Repository URL:</strong>{' '}
                        <a
                            href={currentChat.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer">
                            {currentChat.repoUrl}
                        </a>
                    </div>
                    <div>
                        <strong>Created:</strong>{' '}
                        {new Date(currentChat.creationDate).toLocaleString()}
                    </div>
                    <div>
                        <strong>Last Message:</strong>{' '}
                        {currentChat.lastMessageDate
                            ? new Date(
                                  currentChat.lastMessageDate,
                              ).toLocaleString()
                            : '—'}
                    </div>
                    <div>
                        <strong>Message Count:</strong>{' '}
                        {currentChat.messageCount}
                    </div>
                    <div>
                        <strong>Status:</strong> {currentChat.status}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
