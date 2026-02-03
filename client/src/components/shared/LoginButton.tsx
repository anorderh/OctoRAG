import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { useModalStore } from '../../store/modal';
import { Modal } from './Modal';

export function LoginButton({}: ComponentProps) {
    const { opened, open, close } = useModalStore();

    return (
        <>
            <button onClick={open} id="loginButton" className="solid-button">
                <span>Sign In</span>
            </button>
            <Modal open={opened} onClose={close}>
                <div className="d-flex flex-column justify-content-start align-items-center">
                    <h2>Dialog Title</h2>
                    <p>This is a modal dialog.</p>
                    <button className="page-button rounded" onClick={close}>
                        Close
                    </button>
                </div>
            </Modal>
        </>
    );
}
