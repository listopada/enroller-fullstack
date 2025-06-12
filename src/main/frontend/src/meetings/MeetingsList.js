import { useState } from "react";
import MeetingButtons from "./MeetingButtons";

export default function MeetingsList({ meetings, username, onDelete, onSignOut, onSignIn, onEditSubmit }) {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedMeeting, setEditedMeeting] = useState(null);

    const handleEditClick = (meeting, index) => {
        setEditingIndex(index);
        setEditedMeeting({ ...meeting });
    };

    const handleSave = () => {
        onEditSubmit(editingIndex, editedMeeting);
        setEditingIndex(null);
    };

    return (
        <table>
            <thead>
            <tr>
                <th>Nazwa spotkania</th>
                <th>Opis</th>
                <th>Data</th>
                <th>Uczestnicy</th>
                <th>Akcje</th>
            </tr>
            </thead>
            <tbody>
            {
                meetings.map((meeting, index) => (
                    <tr key={index}>
                        <td>
                            {
                                editingIndex === index
                                    ? <input
                                        value={editedMeeting.title}
                                        onChange={(e) => setEditedMeeting({ ...editedMeeting, title: e.target.value })}
                                    />
                                    : meeting.title
                            }
                        </td>
                        <td>
                            {
                                editingIndex === index
                                    ? <input
                                        value={editedMeeting.description}
                                        onChange={(e) => setEditedMeeting({ ...editedMeeting, description: e.target.value })}
                                    />
                                    : meeting.description
                            }
                        </td>
                        <td>{meeting.date}</td>
                        <td>
                            {
                                Array.isArray(meeting.participants) && meeting.participants.length > 0
                                    ? <ul>
                                        {meeting.participants.map((p, i) => (
                                            p
                                                ? <li key={typeof p === 'object' ? p.login || i : p + i}>
                                                    {typeof p === 'object' ? p.login : p}
                                                </li>
                                                : null
                                        ))}
                                    </ul>
                                    : <em>Brak uczestników</em>
                            }
                        </td>
                        <td>
                            {
                                editingIndex === index ? (
                                    <>
                                        <button onClick={handleSave} className="meeting-button button-animate">Zapisz</button>
                                        <button onClick={() => setEditingIndex(null)} className="button-animate">Anuluj</button>
                                    </>
                                ) : (
                                    <MeetingButtons
                                        meeting={meeting}
                                        username={username}
                                        onDelete={() => onDelete(meeting)}
                                        onSignIn={() => onSignIn(meeting)}
                                        onSignOut={() => onSignOut(meeting)}
                                        onEdit={() => handleEditClick(meeting, index)}
                                    />
                                )
                            }
                        </td>

                    </tr>
                ))
            }
            </tbody>
        </table>
    );
}
