import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { LoginPageOption } from './Login';

export type LoginOptionToggleProps = ComponentProps & {
    option: LoginPageOption;
    setOption: (option: LoginPageOption) => void;
    submitting: boolean;
};

export function LoginOptionToggle({
    option,
    setOption,
    submitting,
}: LoginOptionToggleProps) {
    return (
        <div className="w-100 d-flex flex-row justify-content-center gap-2">
            <button
                disabled={submitting}
                onClick={() => setOption(LoginPageOption.Login)}
                className={
                    'solid-button' +
                    (option == LoginPageOption.Login ? ' text-primary' : '')
                }>
                Login
            </button>
            <button
                disabled={submitting}
                onClick={() => setOption(LoginPageOption.Register)}
                className={
                    'solid-button' +
                    (option == LoginPageOption.Register ? ' text-primary' : '')
                }>
                Register
            </button>
        </div>
    );
}
