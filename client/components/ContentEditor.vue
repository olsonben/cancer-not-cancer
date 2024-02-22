<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'


const props = defineProps({
    initialContent: { type: String, default: '' },
})

// const content = ref(props.initialContent)

const emit = defineEmits(['update'])
const editor = useEditor({
  content: props.initialContent,
  extensions: [
    StarterKit,
  ],
  onUpdate: () => {
    emit('update', editor.value.getHTML())
  }
})


// watch(content, async (newContent, oldContent) => {
//     emit('update', newContent)
// })
// watch(editor, async (newContent, oldContent) => {
//   console.log('editor change')
//   console.log(newContent)
//     // emit('update', newContent)
// })
</script>

<template>
    <div class="field">
      <div class="control">
        <!-- <textarea v-model="content" class="textarea" placeholder="Textarea"></textarea> -->
        <EditorContent :editor="editor" />
      </div>
    </div>
</template>

<style lang="scss" scoped>
</style>