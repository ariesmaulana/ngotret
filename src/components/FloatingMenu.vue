<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotes } from '../composables/useNotes';

const { saveNote, updateNote, currentNoteId, currentNote } = useNotes();
const showExportMenu = ref(false);

// Props to access editor
const props = defineProps(['getEditorContent']);

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value;
};

const handleSave = () => {
  const content = props.getEditorContent?.() || '';
  if (content.trim()) {
    // If a note is currently selected, update it; otherwise create a new note
    if (currentNoteId.value) {
      updateNote(currentNoteId.value, content);
      console.log('Note updated successfully');
    } else {
      saveNote(content);
      console.log('Note saved successfully');
    }
  }
};

const getFilename = (content, extension) => {
  let filename = 'Untitled Note';
  
  if (currentNote.value && currentNote.value.title) {
    filename = currentNote.value.title;
  } else {
    // Try to extract title from content
    const lines = content.trim().split('\n');
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.startsWith('# ')) {
        filename = firstLine.substring(2).trim();
      } else if (firstLine.length > 0) {
        filename = firstLine.substring(0, 30);
      }
    }
  }
  
  // Sanitize filename
  filename = filename.replace(/[^a-z0-9\s-_]/gi, '').trim();
  if (!filename) filename = 'note';
  
  return `${filename}.${extension}`;
};

const handleExportTxt = () => {
  const content = props.getEditorContent?.() || '';
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getFilename(content, 'txt');
  a.click();
  URL.revokeObjectURL(url);
  showExportMenu.value = false;
};

const handleExportMd = () => {
  const content = props.getEditorContent?.() || '';
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getFilename(content, 'md');
  a.click();
  URL.revokeObjectURL(url);
  showExportMenu.value = false;
};

const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    handleSave();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
    e.preventDefault();
    handleExportMd();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="floating-menu">
    <button class="menu-button save-button" @click="handleSave">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      <span>Save</span>
    </button>

    <div class="export-container">
      <button class="menu-button export-button" @click="toggleExportMenu">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Export</span>
        <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <transition name="dropdown">
        <div v-if="showExportMenu" class="export-dropdown">
          <button class="dropdown-item" @click="handleExportTxt">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Export as .txt</span>
          </button>
          <button class="dropdown-item" @click="handleExportMd">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Export as .md</span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.floating-menu {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 1000;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.floating-menu:hover {
  opacity: 1;
}

.menu-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  color: #aaa;
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #333;
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
  backdrop-filter: blur(12px);
}

.menu-button:active {
  transform: translateY(0);
}

.save-button {
  background: transparent;
}

.export-button {
  background: transparent;
}

.export-button:hover {
  background: rgba(255, 255, 255, 0.85);
}

.export-container {
  position: relative;
}

.dropdown-icon {
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.export-button:hover .dropdown-icon {
  transform: translateY(2px);
}

.export-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: white;
  color: #333;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%);
  color: #f5576c;
}

.dropdown-item svg {
  flex-shrink: 0;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 640px) {
  .floating-menu {
    bottom: 12px;
    right: 12px;
    gap: 8px;
  }

  .menu-button {
    padding: 8px 14px;
    font-size: 13px;
  }

  .menu-button span {
    display: none;
  }
}
</style>
