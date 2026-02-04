export interface RepoChat {
    id: string;
    repoName: string;
    repoUrl: string;
    creationDate: string;
    lastMessageDate?: string;
    messageCount: number;
}
