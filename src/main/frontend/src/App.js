import "milligram";
import './App.css';
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import UserPanel from "./UserPanel";

function App() {
    const [loggedIn, setLoggedIn] = useState('');

    useEffect(() => {
        const savedLogin = localStorage.getItem("username");
        if (savedLogin) {
            setLoggedIn(savedLogin);
        }
    }, []);

    async function ensureParticipantExists(email) {
        const response = await fetch(`/api/participants/${email}`);
        if (!response.ok) {
            await fetch(`/api/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: email })
            });
        }
    }

    async function login(email) {
        if (email) {
            await ensureParticipantExists(email);
            setLoggedIn(email);
            localStorage.setItem("username", email);
        }
    }

    function logout() {
        setLoggedIn('');
        localStorage.removeItem("username");
    }

    return (
        <div className="container">
            <h1>System do zapisów na zajęcia</h1>
            {loggedIn
                ? <UserPanel username={loggedIn} onLogout={logout} />
                : <LoginForm onLogin={login} />}
        </div>
    );
}

export default App;
