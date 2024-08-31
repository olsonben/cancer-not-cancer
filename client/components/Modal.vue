<script setup>
const show = defineModel('show', { default: true })
const emit = defineEmits(['close'])

const close = () => {
    show.value = false
    emit('close')
}
</script>

<template>
    <div class="modal" :class="{ 'is-active': show }">
        <div class="modal-background" @click="close"></div>
        <div class="modal-content">
            <div class="section">
                <div class="box p-5">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>