import { useParams } from 'react-router';

export function ChatPage() {
    const { chatId } = useParams<{ chatId: string }>();

    return (
        <div className="w-100 p-2 d-flex flex-row gap-2">
            <div id="repoInfo" className="info-card rounded p-2"></div>
            <div
                id="repoChats"
                className="chat-container h-100 rounded border-1 border-grey bg-transparent"></div>
        </div>
    );
}
