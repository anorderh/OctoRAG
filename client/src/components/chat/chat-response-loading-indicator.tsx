import octoragLogo from '@/assets/logo/octo-logo.png';
import { ChatStatus } from '@/shared/constants/chat-status.enums';
import { Check, Loader2, XCircle } from 'lucide-react';

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

export function ChatResponseLoadingIndicator({ status, date }: Props) {
    const isReady = status === ChatStatus.READY;
    const isError = status === ChatStatus.ERROR;

    const formattedDateTime =
        date &&
        new Date(date).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

    return (
        <div className="flex items-center gap-3 text-sm leading-none text-muted-foreground font-medium">
            <img
                src={octoragLogo}
                alt="logo"
                className="h-8 w-8 rounded-sm shrink-0"
            />

            {isError ? (
                <div className="flex items-center gap-2">
                    <span className="text-destructive">
                        {STATUS_LABELS[status]}
                    </span>
                    <XCircle className="h-4 w-4 text-destructive" />
                </div>
            ) : isReady ? (
                <div className="flex items-center gap-2">
                    <span>{formattedDateTime}</span>
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
