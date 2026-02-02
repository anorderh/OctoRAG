import octoragLogo from '../../assets/octorag-logo.png';
import { useAppliedBreadcrumb } from '../../hooks/trackBreadcrumb';
import { BreadcrumbId } from '../../shared/constants/breadcrumb-id';

export function Home() {
    useAppliedBreadcrumb({
        id: BreadcrumbId.Home,
        display: 'Home',
        icon: 'fa-solid fa-house',
    });

    return (
        <div className="d-flex flex-column gap-2">
            <div
                id="header"
                className="d-flex flex-row w-100 justify-content-betewen align-items-end">
                <div>
                    <img src={octoragLogo} width={350}></img>
                </div>
                <div className="text-center d-flex flex-column gap-2 pb-5">
                    <h1 className="fw-bold">
                        Octo<i>RAG</i>
                    </h1>
                    <h3>
                        Chat wit Github Repositories using Retrieval Augmented
                        Generation.
                    </h3>
                </div>
            </div>
            <div
                id="chat-grid"
                className="rounded p-2 mt-5 d-flex justify-content-center align-items-center"
                style={{ height: 450 }}>
                <span className="idle-text fst-italic text-muted pb-5">
                    No chats present
                </span>
            </div>
        </div>
    );
}
