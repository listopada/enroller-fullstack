import { useState } from "react";

export default function LoginForm({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email || !validateEmail(formData.email)) {
            newErrors.email = 'Podaj prawidłowy adres email';
        }

        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Hasło musi mieć minimum 6 znaków';
        }

        if (isRegistering && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Hasła nie są identyczne';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const endpoint = isRegistering
                ? '/api/participants/register'
                : '/api/participants/auth';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                throw new Error(isRegistering
                    ? 'Użytkownik o tym adresie email już istnieje'
                    : 'Nieprawidłowy email lub hasło');
            }

            if (isRegistering) {
                setIsRegistering(false);
                setFormData(prev => ({ ...prev, confirmPassword: '' }));
                setErrors({});
            } else {
                const data = await response.json();
                onLogin({ login: formData.email, token: data.token });
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message
            }));
        } finally {
            setLoading(false);
        }
    };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
        setFormData({
            email: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>{isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}</h2>
            <div>
                <label htmlFor="email">E-mail:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    disabled={loading}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div>
                <label htmlFor="password">Hasło:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    disabled={loading}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            {isRegistering && (
                <div>
                    <label htmlFor="confirmPassword">Potwierdź hasło:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
            )}

            {errors.submit && <div className="error-message">{errors.submit}</div>}

            <div className="button-group">
                <button
                    type="submit"
                    className="button-primary button-animate"
                    disabled={loading}
                >
                    {loading ? 'Proszę czekać...' : (isRegistering ? 'Zarejestruj się' : 'Zaloguj się')}
                </button>
            </div>

            <div className="form-footer">
                <button
                    type="button"
                    className="button-clear button-animate"
                    onClick={toggleForm}
                    disabled={loading}
                >
                    {isRegistering
                        ? 'Masz już konto? Zaloguj się'
                        : 'Nie masz konta? Zarejestruj się'}
                </button>
            </div>
        </form>
    );
}