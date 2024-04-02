<script setup>
const api = useApi()

const props = defineProps({
    label: String,
    sizeClass: String,
    initialTaskId: {
        type: Number,
        default() { return null }
    }
})

const emit = defineEmits(['taskSelected'])

// get tasks assigned to user
const { response: tasks } = await api.GET('/tasks/')
const selectedTask = ref(props.initialTaskId)

if (selectedTask.value === null && tasks.value[0]) {
    selectedTask.value = tasks.value[0].id
}

if (!tasks.value[0]) {
    console.log('You have no assigned tasks.')
}

watch(selectedTask, async (newTask, oldTask) => {
    emit('taskSelected', newTask)
})
</script>

<template>
    <div class='task-picker'>
        <strong v-if="props.label">{{props.label}}: </strong>
        <div class="select" :class="[sizeClass, {'is-normal' : !sizeClass} ]">
            <select v-model="selectedTask">
                <option v-for="task in tasks" :value="task.id">{{ task.prompt }}</option>
            </select>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.task-picker {
    select {
        font-weight: 600;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;

        option {
            white-space: normal;
        }

}}
</style>