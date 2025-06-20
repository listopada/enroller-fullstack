function MeetingButtons({ meeting, username, onDelete, onSignIn, onSignOut, onEdit }) {
    const isParticipant = Array.isArray(meeting.participants) && meeting.participants.some(p => {
        if (!p) return false;
        if (typeof p === 'object') return p.login === username;
        return p === username;
    });

    return (
        <div className="meeting-buttons">
            {!isParticipant && (
                <button onClick={onSignIn} className="meeting-button button-animate">
                    Dołącz
                </button>
            )}
            {isParticipant && (
                <button onClick={onSignOut} className="meeting-button button-animate">
                    Wypisz się
                </button>
            )}
            <button onClick={onEdit} className="meeting-button button-animate">
                Edytuj
            </button>
            {!isParticipant && (
                <button onClick={onDelete} className="meeting-button button-animate">
                    Usuń
                </button>
            )}
        </div>
    );
}

export default MeetingButtons;