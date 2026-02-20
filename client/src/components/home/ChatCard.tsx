import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router';
import { ChatStatus } from '../../shared/constants/chat-status.enums';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RepoChat } from '../../shared/interfaces/RepoChat';
import { ChatStatusBadge } from '../chat/ChatStatusBadge';

type ChatCardProps = ComponentProps & {
    chat: RepoChat;
};

export function ChatCard({ chat }: ChatCardProps) {
    const navigate = useNavigate();
    const isLoading = () => chat.status == ChatStatus.LOADING;

    function navToPage() {
        navigate(`chat/${chat._id}`);
    }

    return (
        <button
            onClick={() => navToPage()}
            className="chat-card card-select flex-grow-1 rounded shadow p-3 d-flex flex-column">
            <div className="d-flex flex-row justify-content-between align-items-start">
                <h6 className="repo-name fw-bold">{chat.repoName}</h6>
                <div className="rounded-3 p-2 badge" title="Message Count">
                    <FontAwesomeIcon
                        icon="fa-solid fa-message"
                        className="me-2"
                    />
                    <span className="text-white">{chat.messageCount}</span>
                </div>
            </div>
            <span className="d-flex flex-column gap-2">
                <a
                    style={{
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}
                    href={chat.repoUrl}
                    target="_blank"
                    className="d-flex flex-row align-items-center text-wrap flex-wrap"
                    rel="noopener noreferrer">
                    <FontAwesomeIcon
                        style={{ width: 16, height: 16 }}
                        className="me-2"
                        icon="fa-brands fa-github"></FontAwesomeIcon>
                    <span
                        style={{
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                        }}
                        className="pt-0 mb-0 fs-6">
                        {chat.repoUrl}
                    </span>
                </a>
                <div title="Created Date">
                    <FontAwesomeIcon
                        icon={'fa-solid fa-calendar'}
                        className="me-1"
                    />
                    <span>
                        {new Date(chat.creationDate).toLocaleDateString()}
                    </span>
                </div>
            </span>
            <div
                style={{
                    fontSize: 14,
                }}
                className="d-flex flex-row justify-content-end align-items-end gap-2 mt-auto">
                <ChatStatusBadge status={chat.status} />
            </div>
        </button>
    );
}
