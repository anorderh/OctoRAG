import octoragLogo from '../../assets/octorag-logo.png';

export function Header() {
    return (
        <div
            id="header"
            className="d-flex flex-row w-100 justify-content-betewen align-items-end mb-4">
            <div>
                <img src={octoragLogo} width={350}></img>
            </div>
            <div className="text-center d-flex flex-column gap-2 pb-5">
                <h1 className="fw-bold">
                    Octo<i>RAG</i>
                </h1>
                <h3>
                    Chat with Github repositories using Retrieval Augmented
                    Generation
                </h3>
            </div>
        </div>
    );
}
