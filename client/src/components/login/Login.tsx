import { useState } from 'react';
import octoragLogo from '../../assets/octorag-logo.png';
import { LoginCard } from './LoginCard';
import { LoginOptionToggle } from './LoginOptionToggle';

export enum LoginPageOption {
    Register = 'Register',
    Login = 'Login',
}

export function Login() {
    const [option, setOption] = useState(LoginPageOption.Login);
    const [submitting, setSubmitting] = useState(false);

    return (
        <div className="d-flex flex-grow-1 justify-content-center align-items-center w-75">
            <div
                className="bg-card border-white border-1 py-1 p-2 rounded shadow-4"
                style={{ width: '400px' }}>
                <div className="d-flex justify-content-center align-items-center col-sm-12 py-4">
                    <img src={octoragLogo} width={200}></img>
                </div>
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
                {option == LoginPageOption.Register && <div>sdfsfs </div>}
            </div>
        </div>
    );
}
