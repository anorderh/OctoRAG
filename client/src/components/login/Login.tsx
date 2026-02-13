import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import octoragLogo from '../../assets/octorag-logo.png';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuthStore } from '../../store/auth';
import { Badge, type BadgeComponentProps } from '../shared/Badge';
import { LoginCard } from './LoginCard';
import { LoginOptionToggle } from './LoginOptionToggle';
import { RegisterCard } from './RegisterCard';

export enum LoginPageOption {
    Register = 'Register',
    Login = 'Login',
}

export function Login() {
    const currentUser = useCurrentUser();
    const authLoading = useAuthStore((state) => state.authLoading);
    const [option, setOption] = useState(LoginPageOption.Login);
    const [submitting, setSubmitting] = useState(false);
    const [badgeProps, setBadgeProps] = useState<BadgeComponentProps | null>(
        null,
    );
    const navigate = useNavigate();

    // Redirect to homepage if user is logged in.
    useEffect(() => {
        if (currentUser != null && authLoading != null) {
            navigate('/');
        }
    }, [currentUser, authLoading]);

    return (
        <div className="d-flex flex-grow-1 justify-content-center align-items-center w-75">
            <div
                className="bg-card border-white border-1 py-1 p-2 rounded shadow-4"
                style={{ width: '400px' }}>
                <div className="d-flex justify-content-center align-items-center col-sm-12 py-4">
                    <img src={octoragLogo} width={200}></img>
                </div>
                {badgeProps != null && (
                    <Badge
                        bsColor={badgeProps.bsColor}
                        text={badgeProps.text}
                    />
                )}
                <LoginOptionToggle
                    option={option}
                    setOption={setOption}
                    submitting={submitting}
                />
                {option == LoginPageOption.Login && (
                    <LoginCard
                        submitting={submitting}
                        setSubmitting={setSubmitting}
                    />
                )}
                {option == LoginPageOption.Register && (
                    <RegisterCard
                        submitting={submitting}
                        setSubmitting={setSubmitting}
                        setPage={setOption}
                        setBadgeProps={setBadgeProps}
                    />
                )}
            </div>
        </div>
    );
}
