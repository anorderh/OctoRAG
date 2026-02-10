import octoragLogo from '../../assets/octorag-logo.png';

export function Header() {
    return (
        <div
            id="header"
            className="row gap-5 d-flex flex-row w-100 justify-content-between align-items-center mb-4">
            <div className="col-sm-12 col-md-auto d-flex justify-content-center align-items-center col-sm-12">
                <img src={octoragLogo} width={400}></img>
            </div>
            <div className="col-md col-sm-12 text-center d-flex flex-column gap-2">
                <h1 className="fw-bold">
                    Octo<i>RAG</i>
                </h1>
                <h3>
                    Chat with Github repositories using{' '}
                    <span className="fw-bold">
                        {' '}
                        RAG (Retrieval Augmented Generation)
                    </span>
                </h3>
            </div>
        </div>
    );
}
