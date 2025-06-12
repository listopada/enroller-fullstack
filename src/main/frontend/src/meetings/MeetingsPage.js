import { useState, useEffect } from "react";
import NewMeetingForm from "./NewMeetingForm";
import MeetingsList from "./MeetingsList";

export default function MeetingsPage({ username }) {
    const [meetings, setMeetings] = useState([]);
    const [addingNewMeeting, setAddingNewMeeting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };

    useEffect(() => {
        const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };

        setLoading(true);
        fetch("/api/meetings", {
            headers: authHeaders
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    window.location.reload();
                    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
                }
                if (!response.ok) {
                    throw new Error("Nie udało się pobrać spotkań.");
                }
                return response.json();
            })
            .then(data => {
                setMeetings(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    function handleNewMeeting(meeting) {
        setLoading(true);
        setError(null);

        if (!meeting.title || !meeting.description || !meeting.date) {
            setError("Wszystkie pola (tytuł, opis, termin) są wymagane.");
            setLoading(false);
            return;
        }

        const title = meeting.title.trim();
        const description = meeting.description.trim();
        const date = meeting.date;

        if (title.length < 5) {
            setError("Tytuł spotkania musi mieć co najmniej 5 znaków.");
            setLoading(false);
            return;
        }

        if (description.length < 10) {
            setError("Opis spotkania musi mieć co najmniej 10 znaków.");
            setLoading(false);
            return;
        }

        if (title.length > 50) {
            setError("Tytuł spotkania jest za długi (maks. 50 znaków).");
            setLoading(false);
            return;
        }

        if (isNaN(Date.parse(date))) {
            setError("Termin spotkania musi być poprawną datą.");
            setLoading(false);
            return;
        }

        const today = new Date().setHours(0, 0, 0, 0);
        const meetingDate = new Date(date).setHours(0, 0, 0, 0);
        if (meetingDate < today) {
            setError("Termin spotkania nie może być w przeszłości.");
            setLoading(false);
            return;
        }

        const isDuplicate = meetings.some(m =>
            m.title.trim().toLowerCase() === title.toLowerCase() &&
            m.date === date
        );
        if (isDuplicate) {
            setError("Spotkanie o tym tytule i dacie już istnieje.");
            setLoading(false);
            return;
        }

        fetch("/api/meetings", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
                title,
                description,
                date,
                participants: []
            })
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    window.location.reload();
                    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
                }
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || "Błąd serwera przy dodawaniu spotkania.");
                    });
                }
                return response.json();
            })
            .then(newMeeting => {
                setMeetings([...meetings, newMeeting]);
                setAddingNewMeeting(false);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }

    function handleEditMeeting(index, updatedMeeting) {
        setLoading(true);
        setError(null);

        if (!updatedMeeting.title || !updatedMeeting.description || !updatedMeeting.date) {
            setError("Wszystkie pola (tytuł, opis, termin) są wymagane.");
            setLoading(false);
            return;
        }

        const title = updatedMeeting.title.trim();
        const description = updatedMeeting.description.trim();
        const date = updatedMeeting.date;

        if (title.length < 5) {
            setError("Tytuł spotkania musi mieć co najmniej 5 znaków.");
            setLoading(false);
            return;
        }

        if (description.length < 10) {
            setError("Opis spotkania musi mieć co najmniej 10 znaków.");
            setLoading(false);
            return;
        }

        if (title.length > 50) {
            setError("Tytuł spotkania jest za długi (maks. 50 znaków).");
            setLoading(false);
            return;
        }

        if (isNaN(Date.parse(date))) {
            setError("Termin spotkania musi być poprawną datą.");
            setLoading(false);
            return;
        }

        const today = new Date().setHours(0, 0, 0, 0);
        const meetingDate = new Date(date).setHours(0, 0, 0, 0);
        if (meetingDate < today) {
            setError("Termin spotkania nie może być w przeszłości.");
            setLoading(false);
            return;
        }

        const isDuplicate = meetings.some((m, i) =>
            i !== index &&
            m.title.trim().toLowerCase() === title.toLowerCase() &&
            m.date === date
        );

        if (isDuplicate) {
            setError("Spotkanie o tym tytule i dacie już istnieje.");
            setLoading(false);
            return;
        }

        const meetingId = meetings[index].id;
        fetch(`/api/meetings/${meetingId}`, {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify({
                title,
                description,
                date,
                participants: meetings[index].participants
            })
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    window.location.reload();
                    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
                }
                if (!response.ok) {
                    throw new Error("Błąd podczas aktualizacji spotkania.");
                }
                const nextMeetings = [...meetings];
                nextMeetings[index] = {
                    ...meetings[index],
                    title,
                    description,
                    date
                };
                setMeetings(nextMeetings);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }

    function handleDeleteMeeting(meeting) {
        setLoading(true);
        fetch(`/api/meetings/${meeting.id}`, {
            method: "DELETE",
            headers: authHeaders
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    window.location.reload();
                    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
                }
                if (response.status !== 204) throw new Error("Nie udało się usunąć spotkania.");
                const nextMeetings = meetings.filter(m => m.id !== meeting.id);
                setMeetings(nextMeetings);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }

    function handleSignIn(meeting) {
        setLoading(true);
        fetch(`/api/meetings/${meeting.id}/participants`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ login: username })
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    window.location.reload();
                    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
                }
                if (!response.ok) throw new Error("Nie udało się zapisać na spotkanie.");
                return response.json();
            })
            .then(updatedParticipants => {
                const participants = Array.isArray(updatedParticipants)
                    ? updatedParticipants
                        .filter(p => p != null) // usuwamy null i undefined
                        .map(p => typeof p === 'object' ? p.login : p)
                    : [typeof updatedParticipants === 'object' ? updatedParticipants.login : updatedParticipants];

                const nextMeetings = meetings.map(m => {
                    if (m.id === meeting.id) {
                        return {
                            ...m,
                            participants
                        };
                    }
                    return m;
                });
                setMeetings(nextMeetings);
                setLoading(false);
            })
    }

    function handleSignOut(meeting) {
        setLoading(true);
        fetch(`/api/meetings/${meeting.id}/participants/${username}`, {
            method: "DELETE",
            headers: authHeaders
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userLogin');
                    window.location.reload();
                    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
                }
                if (!response.ok) throw new Error("Nie udało się wypisać ze spotkania.");
                return response.json();
            })
            .then(updatedParticipants => {
                const nextMeetings = meetings.map(m => {
                    if (m.id === meeting.id) {
                        return { ...m, participants: updatedParticipants };
                    }
                    return m;
                });
                setMeetings(nextMeetings);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }

    return (
        <div>
            <h2>Spotkania ({meetings.length})</h2>
            {error && <div className="error-message">{error}</div>}
            {addingNewMeeting
                ? <NewMeetingForm onSubmit={handleNewMeeting} />
                : <button onClick={() => { setAddingNewMeeting(true); setError(null); }} className="button-animate">
                    Dodaj nowe spotkanie
                </button>
            }
            {loading && <div className="loader"></div>}
            {!loading && meetings.length > 0 &&
                <MeetingsList
                    meetings={meetings}
                    username={username}
                    onDelete={handleDeleteMeeting}
                    onSignIn={handleSignIn}
                    onSignOut={handleSignOut}
                    onEditSubmit={handleEditMeeting}
                />
            }
        </div>
    );
}