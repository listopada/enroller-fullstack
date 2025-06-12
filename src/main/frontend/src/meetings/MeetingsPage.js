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
        setLoading(true);
        fetch("http://localhost:8080/api/meetings", {
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

        // Walidacje pozostają bez zmian...
        if (!meeting.title || !meeting.description || !meeting.date) {
            setError("Wszystkie pola są wymagane.");
            setLoading(false);
            return;
        }

        const title = meeting.title.trim();
        const description = meeting.description.trim();
        const date = meeting.date;

        // Pozostałe walidacje bez zmian...

        fetch("http://localhost:8080/api/meetings", {
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

    function handleDeleteMeeting(meeting) {
        setLoading(true);
        fetch(`http://localhost:8080/api/meetings/${meeting.id}`, {
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
        fetch(`http://localhost:8080/api/meetings/${meeting.id}/participants`, {
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
                const nextMeetings = meetings.map(m => {
                    if (m.id === meeting.id) {
                        // Transformujemy dane uczestników na same loginy
                        const participants = Array.isArray(updatedParticipants)
                            ? updatedParticipants.map(p => typeof p === 'object' ? p.login : p)
                            : [typeof updatedParticipants === 'object' ? updatedParticipants.login : updatedParticipants];

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
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }

    function handleSignOut(meeting) {
        setLoading(true);
        fetch(`http://localhost:8080/api/meetings/${meeting.id}/participants/${username}`, {
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

    function handleEditMeeting(index, updatedMeeting) {
        setLoading(true);
        setError(null);

        // Walidacje pozostają bez zmian...
        if (!updatedMeeting.title || !updatedMeeting.description || !updatedMeeting.date) {
            setError("Wszystkie pola są wymagane.");
            setLoading(false);
            return;
        }

        const meetingId = meetings[index].id;
        fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify({
                title: updatedMeeting.title.trim(),
                description: updatedMeeting.description.trim(),
                date: updatedMeeting.date,
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
                    title: updatedMeeting.title.trim(),
                    description: updatedMeeting.description.trim(),
                    date: updatedMeeting.date
                };
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