<script setup>
const route = useRoute()
const taskId = Number(route.params.taskId) || null
const api = useApi()
const fileTools = useFileTools()

const { data: taskToEdit } = await api.GET(`/tasks/${taskId}`)
let initialState = structuredClone(toRaw(taskToEdit.value))
const dataStateChange = ref(false)

const currentTask = useState('currentTask', () => taskToEdit)

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

const saveChanges = async () => {
    try {
        const selectedImages = fileTools.getSelectedFiles(currentTask.value.images)

        const result = await api.POST(`/tasks/${taskId}`, {
            ...currentTask.value.task,
            observerIds: JSON.stringify(currentTask.value.observers.filter(user => !!user.applied).map(user => user.id)),
            imageIds: JSON.stringify(selectedImages),
            content: currentTask.value.guide
        })

        console.log('Task changes saved successfully!')
        initialState = structuredClone(toRaw(currentTask.value))
        dataStateChange.value = false

    } catch (error) {
        console.error(error)
    }
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
                <button class="button is-success" :disabled="!dataStateChange" @click="saveChanges">Save
                    Changes</button>
            </p>
        </div>
        <TaskEdit />
    </div>
</template>

<style lang="scss" scoped>

</style>