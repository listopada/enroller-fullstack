import { useState } from "react";
import NewMeetingForm from "./NewMeetingForm";
import MeetingsList from "./MeetingsList";

export default function MeetingsPage({ username }) {
    const [meetings, setMeetings] = useState([]);
    const [addingNewMeeting, setAddingNewMeeting] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleNewMeeting(meeting) {
        setLoading(true);
        setTimeout(() => {
            const nextMeetings = [...meetings, meeting];
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
            <h2>Zajęcia ({meetings.length})</h2>
            {
                addingNewMeeting
                    ? <NewMeetingForm onSubmit={handleNewMeeting} />
                    : <button onClick={() => setAddingNewMeeting(true)} className="button-animate">Dodaj nowe spotkanie</button>

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
