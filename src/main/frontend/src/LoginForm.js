import { useState } from "react";

export default function LoginForm({ onLogin, buttonLabel }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // Prosta funkcja walidująca email
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        if (value === '') {
            setError('');
        } else if (!validateEmail(value)) {
            setError('Niepoprawny format e-maila');
        } else {
            setError('');
        }
    };

    const handleLogin = () => {
        if (!error && email) {
            onLogin(email);
        }
    };

    return (
        <div>
            <label>Zaloguj się e-mailem</label>
            <input type="text" value={email} onChange={handleChange} />
            {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
            <button
                type="button"
                onClick={handleLogin}
                className="button-animate"
                disabled={!!error || !email}
            >
                {buttonLabel || 'Wchodzę'}
            </button>
        </div>
    );
}
