import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router';
import { ChatStatus } from '../../shared/constants/chat-status.enums';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RepoChat } from '../../shared/interfaces/RepoChat';

type ChatCardProps = ComponentProps & {
    chat: RepoChat;
};

export function ChatCard({ chat }: ChatCardProps) {
    const navigate = useNavigate();
    const isLoading = () => chat.status == ChatStatus.LOADING;

    function navToPage() {
        navigate(`chat/${chat.id}`);
    }

    return (
        <button
            onClick={() => navToPage()}
            className="chat-card card-select flex-grow-1 rounded shadow p-3 d-flex flex-column">
            <div className="d-flex flex-row justify-content-between align-items-start">
                <h6 className="repo-name fw-bold">{chat.repoName}</h6>
                <div
                    className="rounded-3 p-2 py-0"
                    style={{ backgroundColor: 'var(--color-badge)' }}>
                    <span className="text-white">{chat.messageCount}</span>
                </div>
            </div>
            <span>
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
            </span>
            {isLoading() ? (
                <div className="mt-3">
                    <div className="badge p-2 bg-secondary rounded-2">
                        <span>LOADING</span>
                    </div>
                </div>
            ) : (
                <div className="mt-3">
                    <div className="badge p-2 bg-primary rounded-2">
                        <span>READY</span>
                    </div>
                </div>
            )}
            <div
                style={{
                    fontSize: 14,
                }}
                className="d-flex flex-column gap-2 mt-auto">
                <span>
                    Created Date:{' '}
                    {new Date(chat.creationDate).toLocaleDateString()}
                </span>
                {chat.lastMessageDate && (
                    <span>Last Message Date: {chat.lastMessageDate}</span>
                )}
            </div>
        </button>
    );
}
