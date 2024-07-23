<script setup>
const route = useRoute()
const taskId = Number(route.params.taskId) || null
const api = useApi()

const { data: taskToEdit } = await api.GET(`/tasks/${taskId}`)
const initialState = structuredClone(toRaw(taskToEdit.value))

const dataStateChange = ref(false)

watch(taskToEdit, (newTask, oldTask) => {
    if (deepEqual(initialState, newTask)) {
        dataStateChange.value = false
    } else {
        dataStateChange.value = true
    }
}, { deep: true })

const reset = () => {
    taskToEdit.value = structuredClone(initialState)
}

</script>

<template>
    <div class="section pt-0">
        <div class="field is-grouped">
            <p class="control">
                <NuxtLink to="/admin/tasks">
                    <button class="button is-primary"><span class="icon">
                            <fa-icon :icon="['fas', 'chevron-left']" />
                        </span>&nbsp;
                        Back</button>
                </NuxtLink>
            </p>
            <p class="control">
                <button class="button is-danger" :disabled="!dataStateChange" @click="reset">Reset
                    Changes</button>
            </p>
            <p class="control">
                <button class="button is-success" :disabled="!dataStateChange" @click="saveTrigger = !saveTrigger">Save
                    Changes</button>
            </p>
        </div>
        <TaskEdit v-model="taskToEdit"/>
    </div>
</template>

<style lang="scss" scoped>

</style>