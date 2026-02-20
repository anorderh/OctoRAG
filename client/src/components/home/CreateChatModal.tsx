import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { RepoChatPost } from '../../shared/interfaces/RepoChat';
import { type RepoChat } from '../../shared/interfaces/RepoChat';
import { useChatStore } from '../../store/chat';
import { Badge } from '../shared/Badge';
import { Modal, type ModalComponentProps } from '../shared/Modal';

type CreateChatForm = {
    name: string;
    url: string;
};

export function CreateChatModal({ close, opened }: ModalComponentProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<CreateChatForm>();
    const { create } = useChatStore();
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);
    function createChat(data: { name: string; url: string }) {
        try {
            const post: RepoChatPost = {
                repoName: data.name,
                repoUrl: data.url,
            };
            setSubmitting(true);
            create(post).then((chat: RepoChat) => {
                setSubmitting(false);
                navigate(`chat/${chat._id}`);
            });
        } catch (err) {
            setError('root', {
                type: 'server',
                message: 'Something went wrong. Try again.',
            });
        } finally {
            setSubmitting(false);
        }
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
                                    required: 'A name is required',
                                })}></input>
                            {errors.name && (
                                <p className="text-danger fs-6">
                                    {errors.name.message}
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
                                    required: 'A repository URL is required',
                                    pattern: {
                                        value: /^https?:\/\/(www\.)?github\.com\/[^\/\s]+\/[^\/\s]+\/?$/i,
                                        message:
                                            'Must be a valid GitHub repository URL',
                                    },
                                })}></input>
                            {errors.url && (
                                <p className="text-danger fs-6">
                                    {errors.url.message}
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
                        {errors.root && (
                            <Badge
                                bsColor={'danger'}
                                text={errors.root.message!}
                            />
                        )}
                    </div>
                </form>
            </div>
        </Modal>
    );
}
