import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useShallow } from 'zustand/react/shallow';
import { useModalState } from '../../hooks/useModalState';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import { ChatStatus } from '../../shared/constants/chat-status.enums';
import { useMessageStore } from '../../store/messages';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { Modal } from '../shared/Modal';
import { ChatActionLog } from './ChatActionLog';

export function ChatActionPanel() {
    const currentChat = useSelectedChat();
    const currentMessages = useMessageStore(
        useShallow((state) => state.getChatMessages(currentChat?.id ?? '')),
    );
    const clearChats = useMessageStore((state) => state.clearChat);

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
        if (currentMessages.length > 0) {
            openDeleteModal();
        }
    }
    function deleteChats() {
        const chatId = currentChat?.id;
        if (chatId != null) {
            clearChats(chatId);
        }
    }
    function rerunScrape() {
        console.log('Rerun scrape attempted');
    }

    const hasMessages = () => currentMessages.length > 0;
    const isLoading = () => currentChat?.status == ChatStatus.LOADING;

    return (
        <div
            style={{
                width: '40%',
                maxWidth: '500px',
            }}
            className={'d-flex flex-column align-items-start gap-2 mb-4 '}>
            <div className="d-flex flex-row gap-2 justify-content-center align-items-center w-100">
                <span className="ms-2 mb-1 fs-4 fw-bold">Logs</span>
                {currentChat?.status == ChatStatus.LOADING && (
                    <FontAwesomeIcon
                        className="fa-spin fs-4"
                        icon={'fa-solid fa-spinner fa-spin'}></FontAwesomeIcon>
                )}
                {isLoading() ? (
                    <div className="ms-auto badge p-2 bg-secondary rounded-2 fs-6">
                        <span>LOADING</span>
                    </div>
                ) : (
                    <div className="ms-auto badge p-2 bg-primary rounded-2 fs-6">
                        <span>READY</span>
                    </div>
                )}
            </div>
            <ChatActionLog />
            <div className="d-flex flex-row gap-2 flex-wrap justify-content-start">
                <button
                    onClick={openRerunModal}
                    disabled={isLoading()}
                    className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-refresh"></FontAwesomeIcon>
                    <span>Rerun scrape</span>
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
                    disabled={!hasMessages()}
                    onClick={attemptDelete}
                    className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-broom"></FontAwesomeIcon>
                    <span>Clear history</span>
                </button>
            </div>
            <ConfirmationModal
                key="deleteChatsModal"
                callback={deleteChats}
                opened={openedDeleteModal}
                close={closeDeleteModal}
                heading={'Delete Confirmation'}
                body={`Would you like to delete Chat "${currentChat?.id}"?`}
            />
            <ConfirmationModal
                key="rerunScrapeModal"
                callback={rerunScrape}
                opened={openedRerunModal}
                close={closeRerunModal}
                heading={'Re-run Scrape Confirmation'}
                body={`Would you like to rerun RAG scrape for Chat "${currentChat?.id}"?`}
            />
            <Modal opened={openedInfoModal} close={closeInfoModal}>
                <div className="d-flex flex-column gap-2 p-2">
                    <h2>Info Modal</h2>
                    <span>Test for Info Modal</span>
                </div>
            </Modal>
        </div>
    );
}
