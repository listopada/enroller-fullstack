export default function MeetingButtons({username, meeting, onDelete, onSignOut, onSignIn, onEdit}) {
    const isAttending = meeting.participants.includes(username);
    const isEmpty = meeting.participants.length === 0;

    return <>
        {
            isAttending
                ? <button onClick={onSignOut} className="meeting-button">Wypisz się</button>
                : <button onClick={onSignIn} className="meeting-button">Zapisz się</button>
        }
        <button onClick={() => onEdit(meeting)} className="meeting-button">Edytuj</button>
        {isEmpty && <button onClick={onDelete} className="button-outline">Usuń spotkanie</button>}
    </>;
}
