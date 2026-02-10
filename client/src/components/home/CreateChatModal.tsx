import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { RepoChatPost } from '../../shared/interfaces/RepoChat';
import { useChatStore } from '../../store/chat';
import { Modal, type ModalComponentProps } from '../shared/Modal';
import type { RepoChat } from './Home';

type CreateChatForm = {
    name: string;
    url: string;
};

export function CreateChatModal({ close, opened }: ModalComponentProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateChatForm>();
    const { create } = useChatStore();
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);
    function createChat(data: { name: string; url: string }) {
        const post: RepoChatPost = {
            repoName: data.name,
            repoUrl: data.url,
        };
        setSubmitting(true);
        create(post).then((chat: RepoChat) => {
            setSubmitting(false);
            navigate(`chat/${chat.id}`);
        });
    }

    return (
        <Modal close={close} opened={opened}>
            <div
                style={{
                    width: 350,
                }}
                className="d-flex flex-column gap-2 p-2">
                <span className="fs-3 w-100 text-center">Create Chat</span>
                <form onSubmit={handleSubmit(createChat)}>
                    <div className="d-flex flex-column w-100 gap-4">
                        <div className="d-flex flex-column gap-1">
                            <label>
                                <FontAwesomeIcon
                                    icon="fa-solid fa-pen"
                                    className="me-2"></FontAwesomeIcon>
                                Name
                            </label>
                            <input
                                disabled={submitting}
                                placeholder="Enter a name for the chat"
                                {...register('name', {
                                    required: true,
                                })}></input>
                            {errors.name && (
                                <p className="text-danger fs-6">
                                    A name is required
                                </p>
                            )}
                        </div>
                        <div className="d-flex flex-column gap-1">
                            <label>
                                <FontAwesomeIcon
                                    icon="fa-solid fa-link"
                                    className="me-2"></FontAwesomeIcon>
                                Repository URL
                            </label>
                            <input
                                disabled={submitting}
                                placeholder="Enter a Github repository URL"
                                {...register('url', {
                                    required: true,
                                    pattern: {
                                        value: /^https?:\/\/(www\.)?github\.com\/[^\/\s]+\/[^\/\s]+\/?$/i,
                                        message:
                                            'Must be a valid GitHub repository URL',
                                    },
                                })}></input>
                            {errors.url?.type == 'required' && (
                                <p className="text-danger fs-6">
                                    A repository URL is required.
                                </p>
                            )}
                            {errors.url?.type == 'pattern' && (
                                <p className="text-danger fs-6">
                                    Must be a valid Github repository URL
                                </p>
                            )}
                        </div>
                        <div>
                            <button
                                disabled={submitting}
                                className="ms-auto solid-button bg-primary"
                                type="submit">
                                {submitting ? (
                                    <>
                                        <FontAwesomeIcon
                                            icon="fa-solid fa-spinner"
                                            className="me-2 fa-spin"></FontAwesomeIcon>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon
                                            icon="fa-solid fa-plus"
                                            className="me-2"></FontAwesomeIcon>
                                        <span>Create Chat</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
