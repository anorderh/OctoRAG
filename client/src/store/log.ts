import { create } from 'zustand';
import type { RepoLog } from '../shared/interfaces/RepoLog';

export interface LogState {
    ids: string[];
    entities: Record<string, RepoLog>;

    upsert: (...logs: RepoLog[]) => void;
    remove: (id: string) => void;
    clear: () => void;
}

export const useLogStore = create<LogState>((set) => ({
    ids: [],
    entities: {},
    upsert: (...newLogs: RepoLog[]) =>
        set((state) => {
            const ids = [...state.ids];
            const entities = { ...state.entities };
            for (const log of newLogs) {
                if (!entities[log._id]) {
                    ids.push(log._id);
                }
                entities[log._id] = log;
            }
            return { ids, entities };
        }),
    remove: (id: string) =>
        set((state) => {
            const { [id]: _, ...rest } = state.entities;
            return {
                entities: rest,
                ids: state.ids.filter((x) => x !== id),
            };
        }),
    clear: () => set({ ids: [], entities: {} }),
}));
