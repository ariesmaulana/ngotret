<script setup>
import { ref, computed } from 'vue';
import { useNotes } from '../composables/useNotes';

const { notes, setCurrentNote, clearCurrentNote, deleteNote, currentNoteId, saveNote } = useNotes();

const isOpen = ref(false);
const searchQuery = ref('');

const filteredNotes = computed(() => {
  if (!searchQuery.value.trim()) return notes.value;
  
  const query = searchQuery.value.toLowerCase();
  return notes.value.filter(note => 
    note.title.toLowerCase().includes(query) || 
    note.preview.toLowerCase().includes(query)
  );
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const selectNote = (noteId) => {
  setCurrentNote(noteId);
  isOpen.value = false; // Close sidebar after selection
};

const createNewNote = () => {
  const newNote = saveNote('# New Note\n\nStart writing...');
  setCurrentNote(newNote.id);
  isOpen.value = false; // Close sidebar
};

const handleDelete = (e, noteId) => {
  e.stopPropagation(); // Prevent selecting the note
  if (confirm('Are you sure you want to delete this note?')) {
    deleteNote(noteId);
    if (currentNoteId.value === noteId) {
      clearCurrentNote();
    }
  }
};
</script>

<template>
  <div>
    <!-- Floating indicator button -->
    <button class="sidebar-toggle" @click="toggleSidebar" :class="{ active: isOpen }">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>

    </button>

    <!-- Sidebar overlay -->
    <transition name="overlay">
      <div v-if="isOpen" class="sidebar-overlay" @click="toggleSidebar"></div>
    </transition>

    <!-- Sidebar -->
    <transition name="slide">
      <div v-if="isOpen" class="sidebar">
        <div class="sidebar-header">
          <h2>Saved Notes</h2>
          <div class="header-actions">
            <button class="new-note-button" @click="createNewNote" title="New Note">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="close-button" @click="toggleSidebar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="search-container">
          <div class="search-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search notes..." 
              class="search-input"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="sidebar-content">
          <div v-if="filteredNotes.length > 0" class="notes-list">
            <div
              v-for="note in filteredNotes"
              :key="note.id"
              class="note-item"
              @click="selectNote(note.id)"
            >
              <div class="note-header">
                <h3 class="note-title">{{ note.title }}</h3>
                <div class="note-actions">
                  <span class="note-date">{{ note.date }}</span>
                  <button class="delete-btn" @click="(e) => handleDelete(e, note.id)" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <p class="note-preview">{{ note.preview }}</p>
            </div>
          </div>

          <div v-else class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>No saved notes yet</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.sidebar-toggle {
  position: fixed;
  top: 40px;
  left: 20px;
  width: 56px;
  height: 56px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 16px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0.3;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #333;
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
  opacity: 1;
  backdrop-filter: blur(12px);
}

.sidebar-toggle:active {
  transform: translateY(0);
}

.sidebar-toggle.active {
  background: rgba(255, 255, 255, 0.85);
  color: #333;
  border-color: rgba(0, 0, 0, 0.15);
  opacity: 1;
  backdrop-filter: blur(12px);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  background: white;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #444;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-note-button {
  background: transparent;
  border: 1px solid #eee;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-note-button:hover {
  background: #f9f9f9;
  color: #333;
  border-color: #ddd;
}

.close-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #f9f9f9;
  color: #333;
}

.search-container {
  padding: 0 24px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #f9f9f9;
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  background: white;
  border-color: #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input::placeholder {
  color: #aaa;
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover {
  background: #eee;
  color: #666;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-item {
  background: white;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  background: #f9f9f9;
}

.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.note-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.note-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.note-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.note-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #ffebee;
  color: #ff4757;
}

.note-preview {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Scrollbar styling */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

@media (max-width: 640px) {
  .sidebar {
    width: 280px;
  }

  .sidebar-toggle {
    width: 48px;
    height: 48px;
    top: 24px;
    left: 12px;
  }
}
</style>
