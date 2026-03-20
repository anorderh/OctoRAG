import octoragLogo from '@/assets/logo/octo-logo.png';
import { ChatStatus } from '@/shared/constants/chat-status.enums';
import { Check, Loader2 } from 'lucide-react';

type Props = {
    status: ChatStatus;
    date?: Date;
};

const STATUS_LABELS: Record<ChatStatus, string> = {
    IDLE: 'Idle',

    PREPARING: 'Preparing repository...',
    INITIALIZING_NAMESPACE: 'Initializing index...',
    CLEARING_NAMESPACE: 'Resetting index...',
    SCRAPING_REPOSITORY: 'Scraping repository...',
    CHUNKING_FILES: 'Chunking files...',
    CONTEXTUALIZING_CHUNKS: 'Understanding code...',
    GENERATING_EMBEDDINGS: 'Generating embeddings...',
    UPSERTING_VECTORS: 'Indexing data...',

    READY: 'Ready',

    RECEIVED_MESSAGE: 'Received message...',
    BUILDING_PIPELINE: 'Building pipeline...',
    REFINING_QUERY: 'Understanding your question...',
    RETRIEVING_DOCUMENTS: 'Searching codebase...',
    RERANKING_DOCUMENTS: 'Ranking results...',
    GENERATING_RESPONSE: 'Generating response...',

    LOADING: 'Loading...',
    RESPONDING: 'Responding...',

    ERROR: 'Something went wrong',
};

export function ChatLoadingIndicator({ status }: Props) {
    const isReady = status === ChatStatus.READY;

    return (
        <div className="flex items-center gap-3 text-sm leading-none text-muted-foreground font-medium">
            <img
                src={octoragLogo}
                alt="logo"
                className="h-8 w-8 rounded-sm shrink-0"
            />

            {isReady ? (
                <div className="flex items-center gap-2">
                    <span>Chat is ready to receive messages.</span>
                    <Check className="h-4 w-4 text-primary" />
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span>{STATUS_LABELS[status]}</span>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}
