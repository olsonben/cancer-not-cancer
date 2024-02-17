<script setup>
const props = defineProps({
    initialContent: { type: String, default: '' },
})

const content = ref(props.initialContent)

const emit = defineEmits(['update'])

watch(content, async (newContent, oldContent) => {
    emit('update', newContent)
})
</script>

<template>
    <div class="field">
      <div class="control">
        <textarea v-model="content" class="textarea" placeholder="Textarea"></textarea>
      </div>
    </div>
</template>

<style lang="scss" scoped>
</style>