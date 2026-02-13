import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api/api';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { BadgeComponentProps } from '../shared/Badge';
import { LoginPageOption } from './Login';

export interface RegisterForm {
    username: string;
    email: string;
    password: string;
}

export type RegisterCardProps = ComponentProps & {
    submitting: boolean;
    setSubmitting: (input: boolean) => void;
    setPage: (input: LoginPageOption) => void;
    setBadgeProps: (input: BadgeComponentProps) => void;
};

export function RegisterCard({
    submitting,
    setSubmitting,
    setPage,
    setBadgeProps,
}: RegisterCardProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<RegisterForm>();

    async function attemptRegister(data: RegisterForm) {
        try {
            setSubmitting(true);

            // Register.
            await api.register(data);
            setBadgeProps({
                bsColor: 'success',
                text: `Account has been created.`,
            });
            setPage(LoginPageOption.Login);
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                setError('root', {
                    type: 'server',
                    message: error.message,
                });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="d-flex flex-column p-2 py-3">
            <form onSubmit={handleSubmit(attemptRegister)}>
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
                                icon="fa-solid fa-envelope"
                                className="me-2"></FontAwesomeIcon>
                            Email
                        </label>
                        <input
                            className="p-2"
                            disabled={submitting}
                            placeholder="Enter an email"
                            {...register('email', {
                                required: 'An email is required',
                            })}></input>
                        {errors.email && (
                            <span className="text-danger fs-6">
                                {errors.email.message}
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
                                    <span>Register</span>
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
