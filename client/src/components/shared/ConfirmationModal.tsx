import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, type ModalComponentProps } from './Modal';

export type ConfirmationModalProps = ModalComponentProps & {
    callback: () => void;
    heading: string;
    body: string;
};

export function ConfirmationModal({
    callback,
    heading = 'Confirmation',
    body = 'This is a confirmation modal.',
    opened,
    close,
}: ConfirmationModalProps) {
    function confirm() {
        if (callback) {
            callback();
        }
        close();
    }
    return (
        <Modal opened={opened} close={close}>
            <div className=" mx-4 p-2 d-flex flex-column justify-content-start align-items-center">
                <h2>{heading}</h2>
                <p>{body}</p>
                <div className="d-flex flex-row gap-4">
                    <button
                        onClick={close}
                        className="bg-danger solid-button rounded">
                        <FontAwesomeIcon
                            style={{ width: 20, height: 20 }}
                            icon="fa-solid fa-x"
                            className="me-2"></FontAwesomeIcon>
                        Close
                    </button>
                    <button
                        onClick={confirm}
                        className="bg-success solid-button rounded">
                        <FontAwesomeIcon
                            style={{ width: 20, height: 20 }}
                            icon="fa-solid fa-check"
                            className="me-2"></FontAwesomeIcon>
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
}
