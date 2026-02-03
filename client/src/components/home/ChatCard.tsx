import { useNavigate } from 'react-router';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RepoChat } from '../../shared/interfaces/RepoChat';

type ChatCardProps = ComponentProps & {
    chat: RepoChat;
};

export function ChatCard({ chat }: ChatCardProps) {
    const navigate = useNavigate();

    function navToPage() {
        navigate(`chat/${chat.id}`);
    }

    return (
        <button
            onClick={() => navToPage()}
            className="chat-card card-select flex-grow-1 flex-wrap rounded shadow p-3 d-flex flex-column">
            <div className="d-flex flex-row justify-content-between">
                <h6 className="repo-name fw-bold">{chat.repoName}</h6>
                <span className="created-at">
                    {new Date(chat.creationDate).toLocaleDateString()}
                </span>
            </div>
            <div>
                <a
                    href={chat.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer">
                    {chat.repoUrl}
                </a>
            </div>
            <div className="d-flex flex-column gap-2 mt-auto fs-6">
                <span>Messages: {chat.messageCount}</span>
                {chat.lastMessageDate && (
                    <span>Last Message Date: {chat.lastMessageDate}</span>
                )}
            </div>
        </button>
    );
}
