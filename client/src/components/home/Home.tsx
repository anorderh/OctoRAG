import { ChatGrid } from './ChatGrid';
import { Header } from './Header';

export function Home() {
    return (
        <div className="d-flex flex-column gap-2 w-75">
            <Header />
            <ChatGrid></ChatGrid>
        </div>
    );
}

export interface RepoChat {
    id: string;
    repoName: string;
    repoUrl: string;
    creationDate: string;
}
