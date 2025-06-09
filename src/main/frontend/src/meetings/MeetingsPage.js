import { useState } from "react";
import NewMeetingForm from "./NewMeetingForm";
import MeetingsList from "./MeetingsList";

export default function MeetingsPage({ username }) {
    const [meetings, setMeetings] = useState([]);
    const [addingNewMeeting, setAddingNewMeeting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            setError("Tytuł spotkania musi mieć co najmniej 3 znaki.");
            setLoading(false);
            return;
        }

        if (description.length < 10) {
            setError("Opis spotkania musi mieć co najmniej 5 znaków.");
            setLoading(false);
            return;
        }

        if (title.length > 50) {
            setError("Tytuł spotkania jest za długi (maks. 100 znaków).");
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

        setTimeout(() => {
            const isError = Math.random() < 0.3;
            if (isError) {
                setError("Nie udało się dodać spotkania. Spróbuj ponownie.");
                setLoading(false);
                return;
            }

            const nextMeetings = [...meetings, {
                ...meeting,
                title,
                description,
            }];
            setMeetings(nextMeetings);
            setAddingNewMeeting(false);
            setLoading(false);
        }, 1000);
    }

    function handleDeleteMeeting(meeting) {
        const nextMeetings = meetings.filter(m => m !== meeting);
        setMeetings(nextMeetings);
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
        const nextMeetings = [...meetings];
        nextMeetings[index] = { ...nextMeetings[index], ...updatedMeeting };
        setMeetings(nextMeetings);
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
