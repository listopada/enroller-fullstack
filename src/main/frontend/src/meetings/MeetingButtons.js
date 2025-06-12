function MeetingButtons({ meeting, username, onDelete, onSignIn, onSignOut, onEdit }) {
    const isParticipant = meeting.participants.some(p =>
        (typeof p === 'object' ? p.login === username : p === username)
    );

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
            <button onClick={onDelete} className="meeting-button button-animate">
                Usuń
            </button>
        </div>
    );
}

export default MeetingButtons;