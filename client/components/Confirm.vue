<script setup>
const { message } = defineProps(['message'])
const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
    <div class="modal" v-bind:class="{ 'is-active': true }">
        <div class="modal-background" @click="emit('cancel')"></div>
        <div class="modal-content">
            <div class="section">
                <div class="box p-5 smooth-height">
                    <div class="field">
                        <label class="label">Confirm</label>
                        <p v-html="message">
                        </p>
                    </div>
                    <div class="field is-grouped">
                        <p class="control">
                            <button class="button is-danger" @click="emit('confirm')">CONFIRM</button>
                        </p>
                        <p class="control">
                            <button class="button is-info" @click="emit('cancel')">CANCEL</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<style lang='scss' scoped>
</style>