import { useState } from "react";

export default function RegisterForm({ onClose }) {
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

        if (formData.password !== formData.confirmPassword) {
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
            const response = await fetch('http://localhost:8080/api/participants/register', {
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
                throw new Error('Użytkownik o tym adresie email już istnieje');
            }

            onClose();
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Zarejestruj się</h2>
            <div>
                <label htmlFor="register-email">E-mail:</label>
                <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    disabled={loading}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div>
                <label htmlFor="register-password">Hasło:</label>
                <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    disabled={loading}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div>
                <label htmlFor="confirm-password">Potwierdź hasło:</label>
                <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    disabled={loading}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            {errors.submit && <div className="error-message">{errors.submit}</div>}

            <div className="button-group">
                <button
                    type="submit"
                    className="button-primary button-animate"
                    disabled={loading}
                >
                    {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                </button>
                <button
                    type="button"
                    className="button-outline button-animate"
                    onClick={onClose}
                    disabled={loading}
                >
                    Anuluj
                </button>
            </div>
        </form>
    );
}