export interface RepoMessage {
    _id: string;
    chatId: string;
    source: 'ai' | 'user';
    content?: string;
    loading?: boolean;
    date: Date;
}

export interface RepoMessagePost {
    chatId: string;
    source: 'ai' | 'user';
    content: string;
}
