import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Footer() {
    return (
        <div
            id="navbar"
            className="d-flex flex-row justify-content-end align-items-center my-2 px-4 mt-4 gap-4"
            style={{
                height: 60,
                width: '98%',
            }}>
            <a
                type="btn"
                href="https://www.linkedin.com/in/anthony-norderhaug/"
                className="icon-button">
                <FontAwesomeIcon
                    style={{ width: 30, height: 30 }}
                    icon="fa-brands fa-linkedin"></FontAwesomeIcon>
            </a>
            <a
                type="btn"
                href="https://github.com/anorderh"
                className="icon-button">
                <FontAwesomeIcon
                    style={{ width: 30, height: 30 }}
                    icon="fa-brands fa-github"></FontAwesomeIcon>
            </a>
            <span>Anthony Norderhaug, 2026</span>
        </div>
    );
}
