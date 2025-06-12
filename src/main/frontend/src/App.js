import "milligram";
import './App.css';
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import UserPanel from "./UserPanel";

function App() {
    const [loggedIn, setLoggedIn] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const savedLogin = localStorage.getItem("userLogin");
        const savedToken = localStorage.getItem("token");
        if (savedLogin && savedToken) {
            setLoggedIn(savedLogin);
            setToken(savedToken);
        }
    }, []);

    function login(loginData) {
        setLoggedIn(loginData.login);
        setToken(loginData.token);
        localStorage.setItem("userLogin", loginData.login);
        localStorage.setItem("token", loginData.token);
    }

    function logout() {
        setLoggedIn('');
        setToken('');
        localStorage.removeItem("userLogin");
        localStorage.removeItem("token");
    }

    return (
        <div className="container">
            <h1>System do zapisów na spotkania</h1>
            {loggedIn
                ? <UserPanel username={loggedIn} token={token} onLogout={logout} />
                : <LoginForm onLogin={login} />}
        </div>
    );
}

export default App;