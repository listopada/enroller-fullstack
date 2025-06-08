export default function MeetingButtons({ username, meeting, onDelete, onSignOut, onSignIn, onEdit }) {
    const isAttending = meeting.participants.includes(username);
    const isEmpty = meeting.participants.length === 0;

    return <>
        {
            isAttending
                ? <button onClick={onSignOut} className="meeting-button button-animate">Wypisz się</button>
                : <button onClick={onSignIn} className="meeting-button button-animate">Zapisz się</button>
        }
        <button onClick={onEdit} className="meeting-button button-animate">Edytuj</button>
        {isEmpty && <button onClick={onDelete} className="button-outline button-animate">Usuń spotkanie</button>}
    </>;
}
