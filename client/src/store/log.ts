import { create } from 'zustand';
import type { RepoLog } from '../shared/interfaces/RepoLog';

export interface LogState {
    logs: RepoLog[];
    add: (...logs: RepoLog[]) => void;
}

export const useLogStore = create<LogState>((set, get) => ({
    logs: [],
    add: (...newLogs: RepoLog[]) =>
        set((state) => {
            const existingIds = new Set(state.logs.map((l) => l._id));
            const filtered = newLogs.filter((log) => !existingIds.has(log._id));
            return {
                logs: [...state.logs, ...filtered],
            };
        }),
}));
