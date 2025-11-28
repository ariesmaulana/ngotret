<script setup>
import { ref } from 'vue';
import Milkdown from './components/MilkdownEditor.vue'
import FloatingMenu from './components/FloatingMenu.vue'
import Sidebar from './components/Sidebar.vue'
import { MilkdownProvider } from '@milkdown/vue';

const editorRef = ref(null);

const getEditorContent = () => {
  return editorRef.value?.getContent() || '';
};
</script>

<template>
  <MilkdownProvider>
    <Sidebar />
    <FloatingMenu :getEditorContent="getEditorContent" />
    <Milkdown ref="editorRef" />
  </MilkdownProvider>
</template>
