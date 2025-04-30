import { useState, useEffect, useCallback, useRef } from "react";
import { saveNotes, loadNotes } from "../services/gistService";

interface NotesProps {
  token: string;
}

const Notes = ({ token }: NotesProps) => {
  const [notes, setNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const notesSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load notes when token is set
  useEffect(() => {
    if (token) {
      setNotesLoading(true);
      loadNotes(token)
        .then((content) => {
          setNotes(content);
          setNotesError(null);
        })
        .catch(() => {
          setNotesError("Failed to load notes from GitHub");
          setNotes("");
        })
        .finally(() => setNotesLoading(false));
    }
  }, [token]);

  // Save notes to gist
  const saveNotesToGist = useCallback(
    async (content: string) => {
      if (!token) return;
      setNotesLoading(true);
      setNotesError(null);
      try {
        await saveNotes(content, token);
      } catch {
        setNotesError("Failed to save notes to GitHub");
      } finally {
        setNotesLoading(false);
      }
    },
    [token]
  );

  // Debounced save on change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    setNotesError(null);
    // Auto-resize logic
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
    if (notesSaveTimeout.current) {
      clearTimeout(notesSaveTimeout.current);
    }
    notesSaveTimeout.current = setTimeout(() => {
      saveNotesToGist(value);
    }, 1000);
  };

  // Auto-resize on initial load and when notes change externally
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [notes]);

  // Save on blur
  const handleNotesBlur = () => {
    if (notesSaveTimeout.current) {
      clearTimeout(notesSaveTimeout.current);
      notesSaveTimeout.current = null;
    }
    saveNotesToGist(notes);
  };

  return (
    <div className="notes-container">
      <textarea
        id="notes"
        className="notes-textarea"
        value={notes}
        onChange={handleNotesChange}
        onBlur={handleNotesBlur}
        rows={4}
        placeholder="Write your notes here..."
        ref={textareaRef}
      />
      {notesLoading && <div className="spinner notes-error" />}
      {notesError && (
        <div className="error-message notes-error">{notesError}</div>
      )}
    </div>
  );
};

export default Notes;
