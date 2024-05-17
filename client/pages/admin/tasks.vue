<script setup>
definePageMeta({
    title: 'Admin - Tasks'
})

const api = useApi()

const task = reactive({
                name: null,
                prompt: null,
            })

const columns = ['Name', 'Prompt', 'Images', 'Observers', 'Progress', 'Actions']
const order = ['short_name', 'prompt', 'image_count', 'observer_count', 'progress', 'action']
const indexProp = 'id'
const taskData = ref([])
const taskToEdit = ref(null)
const exportData = ref(null)


const createTask = async () => {
    try {
        const { response } = await api.POST('/tasks/', {
            short_name: task.name,
            prompt: task.prompt,
        })
        taskData.value.push({
            id: response.value.newTaskId,
            short_name: task.name,
            prompt: task.prompt,
            chip_size: null,
            fov_size: null,
            zoom_scale: null,
            image_count: 0,
            observer_count: 0,
            progress: 0
        })
        task.name = null
        task.prompt = null
    } catch (err) {
        console.log(err)
    }
}

const editTask = (task) => {
    taskToEdit.value = task
}

const updateTaskProgress = async (taskIndex) => {
    try {
        const { response } = await api.GET('/tasks/progress', {
            task_id: taskData.value[taskIndex].id
        })
        const progress = response.value.progress
        taskData.value[taskIndex].progress = progress ? progress : 0
    } catch (err) {
        console.log(err)
    }
}

const finishTaskEdit = (auxData, close = true) => {
    const index = taskData.value.findIndex(task => task.id == taskToEdit.value.id)
    if (auxData.observers !== null)
        taskData.value[index].observer_count = auxData.observers
    if (auxData.images !== null)
        taskData.value[index].image_count = auxData.images
    
    updateTaskProgress(index)
    
    if (close) {
        taskToEdit.value = null
    }
}

const deleteTask = async (task) => {
    try {
        await api.POST('/tasks/delete', {
            id: task.id
        })
        const index = taskData.value.findIndex(curTask => curTask.id === task.id)
        taskData.value.splice(index, 1)
    } catch (err) {
        console.log(err)
    }
}

const exportTask = (task) => {
    console.log(`Export Task ${task.id}`)
    exportData.value = task
}


const { response } = await api.GET('/tasks/table')
taskData.value = response.value


</script>

<template>
    <div>
        <!-- Main tasks -->
        <section class='section tasks-controller'>
            <h1 class='title'>Tasks</h1>
            <div class="pb-2">
                <form @submit.prevent='createTask()'>
                    <div class="field is-horizontal">
                        <div class="field-label is-normal">
                            <label class="label">Create New Task</label>
                        </div>
                        <div class="field-body">
                            <div class="field is-grouped">
                            <p class="control has-icons-left">
                                <input class="input" type="text" :maxlength="100" placeholder="name" v-model="task.name">
                                <span class="icon is-small is-left">
                                <fa-icon :icon="['fas', 'tag']" />
                                </span>
                            </p>
                            <p class="control is-expanded has-icons-left has-icons-right">
                                <input class="input" type="text" placeholder="Prompt" v-model="task.prompt" />
                                <span class="icon is-small is-left">
                                <fa-icon :icon="['fas', 'question']" />
                                </span>
                            </p>
                            <p class="control">
                                <input class='button is-success' type="submit" value="Create" />
                            </p>
                            </div>
                        </div>
                    </div>
                    <div class="field is-horizontal">
                        <div class="field-label is-normal">
                            <p class="help is-size-6">After creating a new task be sure to edit the task in the table below to add observers and images.</p>
                        </div>
                    </div>
                </form>
            </div>
            <div class="py-2">
                <div class='box'>
                    <h3>Existing Tasks</h3>
                    <table class="table is-striped is-narrow is-fullwidth is-hoverable">
                        <thead>
                            <tr>
                                <th v-for="colName in columns">{{ colName }}</th>
                            </tr>
                        </thead>
                        <tbody>

                            <Row v-for="row in taskData" :key="row[indexProp]" :class="{ 'is-selected': false }"  :row="row" :order="order" @edit="editTask" @delete="deleteTask" @export="exportTask" />
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <!-- Edit Task -->
        <TaskEdit v-if="taskToEdit != null" :task="taskToEdit" @save="finishTaskEdit" @cancel="taskToEdit = null"/>
        <Export v-if="exportData != null" :task="exportData" @done="exportData=null" />
    </div>
</template>

<style lang='scss'>

section.tasks-controller {
    padding-top: 0;
}

input:focus + span {
    color: hsl(0, 0%, 4%);
}

</style>