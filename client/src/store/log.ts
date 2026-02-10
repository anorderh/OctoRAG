import { create } from 'zustand';
import type { RepoLog } from '../shared/interfaces/RepoLog';

export interface LogState {
    logs: RepoLog[];
    add: (...logs: RepoLog[]) => void;
}

export const fakeRepoLogs: RepoLog[] = [
    {
        id: 'log-001',
        chatId: 'gameboy',
        date: '01/01/25 09:12',
        content:
            'Repository scan started. Discovered 143 source files across 9 directories.',
    },
    {
        id: 'log-002',
        chatId: 'gameboy',
        date: '01/01/25 09:13',
        content:
            'Filtered non-text assets (images, binaries). 87 files eligible for indexing.',
    },
    {
        id: 'log-003',
        chatId: 'gameboy',
        date: '01/01/25 09:14',
        content:
            'Chunking source files using semantic boundaries. Generated 412 text chunks.',
    },
    {
        id: 'log-004',
        chatId: 'gameboy',
        date: '01/01/25 09:16',
        content:
            'Embedding chunks with vector model (dim=1536). Batch size: 32.',
    },
    {
        id: 'log-005',
        chatId: 'gameboy',
        date: '01/01/25 09:18',
        content:
            'Vector embeddings stored successfully. Index size: 412 vectors.',
    },
    {
        id: 'log-006',
        chatId: 'gameboy',
        date: '01/01/25 09:22',
        content:
            'User query received: "How does cartridge memory banking work?"',
    },
    {
        id: 'log-007',
        chatId: 'gameboy',
        date: '01/01/25 09:22',
        content:
            'Computed query embedding. Performing similarity search (topK=5).',
    },
    {
        id: 'log-008',
        chatId: 'gameboy',
        date: '01/01/25 09:23',
        content: 'Retrieved 5 relevant chunks (similarity ≥ 0.82).',
    },
    {
        id: 'log-009',
        chatId: 'gameboy',
        date: '01/01/25 09:24',
        content: 'Constructing augmented prompt with retrieved context.',
    },
    {
        id: 'log-010',
        chatId: 'gameboy',
        date: '01/01/25 09:25',
        content: 'LLM response generated successfully. Tokens used: 742.',
    },
    {
        id: 'log-011',
        chatId: 'gameboy',
        date: '01/01/25 09:26',
        content: 'Response delivered to user. Latency: 1.4s.',
    },
];

export const useLogStore = create<LogState>((set) => ({
    logs: [...fakeRepoLogs],
    add: (...logs: RepoLog[]) => {
        set((state) => ({ ...state, logs: state.logs.concat(logs) }));
    },
}));
