import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelectedChat } from '../../hooks/selectors/useSelectedChat';
import { useMessageStore } from '../../store/messages';

export function ChatActionPanel() {
    const currentChat = useSelectedChat();
    const clearChats = useMessageStore((state) => state.clearChat);

    function deleteChats() {
        const chatId = currentChat?.id;
        if (chatId != null) {
            clearChats(chatId);
        }
    }

    return (
        <div
            style={{
                width: '40%',
                maxWidth: '500px',
            }}
            className="d-flex flex-column align-items-start gap-2 mb-4">
            <span className="ms-2 mb-1 fs-4 fw-bold">Logs</span>
            <div
                style={{
                    height: '500px',
                }}
                id="repoLogs"
                className="w-100 info-card rounded-3 p-2 shadow-ld bg-black"></div>
            <div className="d-flex flex-row gap-2 flex-wrap justify-content-start">
                <button className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-refresh"></FontAwesomeIcon>
                    <span>Refresh scrape</span>
                </button>
                <button className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-info"></FontAwesomeIcon>
                    <span>Info</span>
                </button>
                <button
                    onClick={() => deleteChats()}
                    className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                    <FontAwesomeIcon
                        style={{ width: 20, height: 20 }}
                        icon="fa-solid fa-trash"></FontAwesomeIcon>
                    <span>Delete chats</span>
                </button>
            </div>
        </div>
    );
}
