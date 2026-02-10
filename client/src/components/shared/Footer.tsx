import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Footer() {
    return (
        <div
            id="navbar"
            className="d-flex flex-row justify-content-end align-items-center pb-4 mt-4 px-4 gap-4 text-white"
            style={{
                height: 60,
                width: '98%',
            }}>
            <a
                type="btn"
                href="https://www.linkedin.com/in/anthony-norderhaug/"
                className="btn text-muted">
                <FontAwesomeIcon
                    style={{ width: 30, height: 30 }}
                    icon="fa-brands fa-linkedin"></FontAwesomeIcon>
            </a>
            <a
                type="btn"
                href="https://github.com/anorderh"
                className="btn text-muted">
                <FontAwesomeIcon
                    style={{ width: 30, height: 30 }}
                    icon="fa-brands fa-github"></FontAwesomeIcon>
            </a>
            <span>Anthony Norderhaug, 2026</span>
        </div>
    );
}
