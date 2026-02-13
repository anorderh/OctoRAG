import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { api } from '../../services/api/api';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { useAuthStore } from '../../store/auth';

export interface LoginForm {
    username: string;
    password: string;
}

export type LoginCardProps = ComponentProps & {
    submitting: boolean;
    setSubmitting: (input: boolean) => void;
};

export function LoginCard({ submitting, setSubmitting }: LoginCardProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginForm>();
    const navigate = useNavigate();
    const authStore = useAuthStore();

    async function attemptLogin(data: LoginForm) {
        try {
            setSubmitting(true);

            // Login.
            const accessToken = await api.login(data);
            authStore.setAccessToken(accessToken);

            // Get current user.
            const user = await api.getSelf();
            authStore.setUser(user);

            // Navigate to home.
            navigate('/');
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    setError('root', {
                        type: 'server',
                        message: 'Invalid username or password',
                    });
                } else {
                    setError('root', {
                        type: 'server',
                        message: 'Something went wrong. Try again.',
                    });
                }
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex flex-column p-2 py-3">
            <form onSubmit={handleSubmit(attemptLogin)}>
                <div className="d-flex flex-column w-100 gap-4">
                    <div className="d-flex flex-column gap-1">
                        <label>
                            <FontAwesomeIcon
                                icon="fa-solid fa-user"
                                className="me-2"></FontAwesomeIcon>
                            Username
                        </label>
                        <input
                            className="p-2"
                            disabled={submitting}
                            placeholder="Enter a username"
                            {...register('username', {
                                required: 'A username is required',
                            })}></input>
                        {errors.username && (
                            <span className="text-danger fs-6">
                                {errors.username.message}
                            </span>
                        )}
                    </div>
                    <div className="d-flex flex-column gap-1">
                        <label>
                            <FontAwesomeIcon
                                icon="fa-solid fa-lock"
                                className="me-2"></FontAwesomeIcon>
                            Password
                        </label>
                        <input
                            className="p-2"
                            disabled={submitting}
                            type="password"
                            placeholder="Enter a password"
                            {...register('password', {
                                required: 'A password is required',
                            })}></input>
                        {errors.password && (
                            <span className="text-danger fs-6">
                                {errors.password.message}
                            </span>
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
                                        icon="fa-solid fa-right-to-bracket"
                                        className="me-2"></FontAwesomeIcon>
                                    <span>Login</span>
                                </>
                            )}
                        </button>
                        {errors.root && (
                            <div className="text-danger text-center mt-3">
                                {errors.root.message}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
