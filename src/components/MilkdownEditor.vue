<script setup>
import { Milkdown, useEditor } from "@milkdown/vue";
import { Crepe } from "@milkdown/crepe";
import { listenerCtx } from "@milkdown/kit/plugin/listener";
import { watch, ref, onMounted } from "vue";
import { useNotes } from "../composables/useNotes";

const { currentNote } = useNotes();

const currentContent = ref(`# Welcome to *Ngotret*!  

> This app has one simple purpose: to write.

I built this because sometimes I just want to jot things down as a quick draft without dealing with fancy features or unnecessary gimmicks.  
That’s why this app exists — it only comes with a **few** essentials:

1. **Client Only** — everything runs 100% in your browser. No server, no tracking, nothing. All your notes stay in your local storage.
2. Supports **Markdown**, thanks to the awesome **Milkdown** library developers who made the integration super easy.
3. **Export** your notes as .txt or .md anytime.
4. **No Login Required** — just open and write.

<br />

### About the name

**Ngotret** comes from Sundanese, my mother tongue. The word is used to describe a rough early-stage process,like when you want to draw something and sketch it out first, or when you need to calculate something and scribble it down.  
Basically, it’s about making quick, rough notes before things get polished.

<br />

Alright, go ahead — start writing!

<br />

Press **Cmd+S (Mac)** or **Ctrl+S (Windows/Linux)** to save your note. It’ll be saved as a **.md** file by default, or you can use the menu below to export it as **.txt**.


`);

const editorKey = ref(0);
const crepeInstance = ref(null);

// Watch for note changes and reload editor
watch(currentNote, (note) => {
  if (note) {
    // Load selected note content and force editor recreation to render markdown
    currentContent.value = note.content;
    editorKey.value++;
  } else {
    // New note placeholder
    currentContent.value = `# New Note\n\nStart writing...`;
    editorKey.value++;
  }
});

useEditor((root) => {
  const crepe = new Crepe({
    root,
    defaultValue: currentContent.value,
  });
  
  // Set up content tracking
  crepe.editor.config((ctx) => {
    ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
      if (markdown !== prevMarkdown) {
        currentContent.value = markdown;
        // console.log('Content updated via listener');
      }
    });
  });
  
  crepeInstance.value = crepe;
  return crepe;
});

// Method to get current content from editor
const getContent = () => {
  // Use tracked content from listener
  if (currentContent.value) {
    return currentContent.value;
  }
  
  return '# New Note\n\nStart writing...';
};

// Expose to parent
defineExpose({
  getContent,
});
</script>

<template>
  <div class="w-[90%] max-w-4xl mx-auto py-12 min-h-screen">
    <Milkdown :key="editorKey" />
  </div>
</template>
