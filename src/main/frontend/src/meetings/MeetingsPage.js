import { useState } from "react";
import NewMeetingForm from "./NewMeetingForm";
import MeetingsList from "./MeetingsList";
import { useEffect } from "react";

export default function MeetingsPage({ username }) {
    const [meetings, setMeetings] = useState([]);
    const [addingNewMeeting, setAddingNewMeeting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:8080/api/meetings")
            .then(response => {
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
            setError("Wszystkie pola są wymagane.");
            setLoading(false);
            return;
        }

        const title = meeting.title.trim();
        const description = meeting.description.trim();
        const date = meeting.date;

        if (title.length < 6) {
            setError("Tytuł spotkania musi mieć co najmniej 6 znaki.");
            setLoading(false);
            return;
        }

        if (description.length < 15) {
            setError("Opis spotkania musi mieć co najmniej 15 znaków.");
            setLoading(false);
            return;
        }

        if (title.length > 20) {
            setError("Tytuł spotkania jest za długi (maks. 20 znaków).");
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

        fetch("http://localhost:8080/api/meetings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                date,
                participants: [] // opcjonalnie
            })
        })
            .then(response => {
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
            method: "DELETE"
        })
            .then(response => {
                if (response.status !== 204) throw new Error("Nie udało się usunąć spotkania.");
                // Po usunięciu z backendu usuwamy z frontendu
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
        setTimeout(() => {
            const nextMeetings = meetings.map(m => {
                if (m === meeting) {
                    m.participants = [...m.participants, username];
                }
                return m;
            });
            setMeetings(nextMeetings);
            setLoading(false);
        }, 1000);
    }

    function handleSignOut(meeting) {
        setLoading(true);
        setTimeout(() => {
            const nextMeetings = meetings.map(m => {
                if (m === meeting) {
                    m.participants = m.participants.filter(u => u !== username);
                }
                return m;
            });
            setMeetings(nextMeetings);
            setLoading(false);
        }, 1000);
    }

    function handleEditMeeting(index, updatedMeeting) {
        setLoading(true);
        setError(null);

        if (!updatedMeeting.title || !updatedMeeting.description || !updatedMeeting.date) {
            setError("Wszystkie pola są wymagane.");
            setLoading(false);
            return;
        }

        const title = updatedMeeting.title.trim();
        const description = updatedMeeting.description.trim();
        const date = updatedMeeting.date;
        const meetingId = meetings[index].id;

        fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                date,
                participants: meetings[index].participants
            })
        })
            .then(response => {
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

    return (
        <div>
            <h2>Spotkania ({meetings.length})</h2>

            {error && <div className="error-message">{error}</div>}

            {
                addingNewMeeting
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
                />}
        </div>
    );
}
