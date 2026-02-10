import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import { useSelectedChat } from '../../hooks/useSelectedChat';

export function ChatConversationPanelHeader() {
    const chat = useSelectedChat();
    return (
        <div
            style={{
                backgroundColor: 'var(--color-card)',
            }}
            className="p-2 px-3 chat-header">
            {chat != null && (
                <div className="p-2 pb-0">
                    <h5 className="repo-name fw-bold text-truncate">
                        {chat.repoName}
                    </h5>
                    <div className="d-flex flex-row gap-2 text-muted">
                        <Link to={chat.repoUrl} className="text-underline-none">
                            <FontAwesomeIcon
                                style={{ width: 16, height: 16 }}
                                className="me-2"
                                icon="fa-brands fa-github"></FontAwesomeIcon>

                            {chat.repoUrl}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
