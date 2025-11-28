import { ref, computed } from 'vue';

const STORAGE_KEY = 'ngotret-notes';

// Shared state across components
const notes = ref([]);
const currentNoteId = ref(null);

// Load notes from localStorage on initialization
const loadNotesFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            notes.value = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading notes from localStorage:', error);
    }
};

// Save notes to localStorage
const saveNotesToStorage = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value));
    } catch (error) {
        console.error('Error saving notes to localStorage:', error);
    }
};

// Extract title from markdown content
const extractTitle = (content) => {
    const lines = content.trim().split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('# ')) {
            return trimmedLine.substring(2).trim();
        }
        if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
            return trimmedLine.substring(0, 50);
        }
    }
    return 'Untitled Note';
};

// Extract preview from content
const extractPreview = (content) => {
    const lines = content.trim().split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
            return trimmedLine.substring(0, 100) + (trimmedLine.length > 100 ? '...' : '');
        }
    }
    return 'No content';
};

// Initialize notes on first load
loadNotesFromStorage();

export function useNotes() {
    const saveNote = (content) => {
        const now = new Date();
        const dateString = now.toISOString().split('T')[0];

        const note = {
            id: now.getTime().toString(),
            title: extractTitle(content),
            content: content,
            date: dateString,
            preview: extractPreview(content),
        };

        // Add to beginning of array
        notes.value.unshift(note);
        saveNotesToStorage();

        return note;
    };

    const updateNote = (id, content) => {
        const index = notes.value.findIndex(n => n.id === id);
        if (index !== -1) {
            // Create updated note
            const updatedNote = {
                ...notes.value[index],
                title: extractTitle(content),
                content: content,
                preview: extractPreview(content),
                date: new Date().toISOString().split('T')[0],
            };

            // Create a new array to ensure reactivity
            const newNotes = [...notes.value];
            newNotes[index] = updatedNote;
            notes.value = newNotes;

            saveNotesToStorage();
            console.log('Note updated:', updatedNote.title);
        }
    };

    const deleteNote = (id) => {
        notes.value = notes.value.filter(n => n.id !== id);
        saveNotesToStorage();
    };

    const getNote = (id) => {
        return notes.value.find(n => n.id === id);
    };

    const setCurrentNote = (id) => {
        currentNoteId.value = id;
    };

    const clearCurrentNote = () => {
        currentNoteId.value = null;
    };

    const currentNote = computed(() => {
        if (!currentNoteId.value) return null;
        return getNote(currentNoteId.value);
    });

    return {
        notes: computed(() => notes.value),
        currentNote,
        currentNoteId: computed(() => currentNoteId.value),
        saveNote,
        updateNote,
        deleteNote,
        getNote,
        setCurrentNote,
        clearCurrentNote,
    };
}
