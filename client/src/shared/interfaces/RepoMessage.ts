export interface RepoMessage {
    _id: string;
    chatId: string;
    source: 'ai' | 'user';
    content?: string;
    loading?: boolean;
    date: Date;
    animate?: boolean;
}

export interface RepoMessagePost {
    chatId: string;
    source: 'ai' | 'user';
    content: string;
}
