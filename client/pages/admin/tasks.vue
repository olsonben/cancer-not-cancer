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
                                <i class="cnc-label-tag"></i>
                                </span>
                            </p>
                            <p class="control is-expanded has-icons-left has-icons-right">
                                <input class="input" type="text" placeholder="Prompt" v-model="task.prompt" />
                                <span class="icon is-small is-left">
                                <i class="cnc-question"></i>
                                </span>
                            </p>
                            <p class="control">
                                <input class='button is-success' type="submit" value="Create" />
                            </p>
                            </div>
                        </div>
                    </div>
                   
                </form>
            </div>
            <div class="py-2">
                <div class='box'>
                    <h3>Existing Tasks</h3>
                    <table class="table is-striped is-narrow is-fullwidth is-hoverable">
                        <thead>
                            <th v-for="colName in columns">{{ colName }}</th>
                        </thead>
                        <tbody>

                            <Row v-for="row in taskData" :key="row[indexProp]" :class="{ 'is-selected': false }"  :row="row" :order="order" @edit="editTask" @delete="deleteTask" />
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <!-- Edit Task -->
        <TaskEdit v-if="taskToEdit != null" class='login-modal' :task="taskToEdit" @save="finishTaskEdit" @cancel="taskToEdit = null"/>
    </div>
</template>

<script>
// TODO: remove when finished initial task development.
const dummyData = [
    {
        'id': 1,
        'short_name': 'task 1',
        'prompt': 'Is this my question?',
        'image_count': 54,
        'observer_count': 3,
        'progress': 45
    },
    {
        'id': 2,
        'short_name': 'another_task_beta_check_240623',
        'prompt': 'Does this have alpha 1 marker properties?',
        'image_count': 212,
        'observer_count': 6,
        'progress': 72
    },
    {
        'id': 4,
        'short_name': 'task b',
        'prompt': 'Is this a blood parasite?',
        'image_count': 100,
        'observer_count': 4,
        'progress': 66
    }
]

export default {
    data() {
        return {
            task: {
                name: null,
                prompt: null,
            },
            columns: ['Name', 'Prompt', 'Images', 'Observers', 'Progress', 'Actions'],
            order: ['short_name', 'prompt', 'image_count', 'observer_count', 'progress', 'action'],
            indexProp: 'id',
            taskData: [],
            taskToEdit: null,
        }
    },
    computed: {
    },
    watch: {
    },
    created() {
        this.getTasksTable()
    },

    mounted() {
        // Allowing scrolling because some table are really long
        document.documentElement.style.setProperty('--overflow', 'initial')
    },
    destroyed() {
        // Turn scrolling off when leaving dataview
        document.documentElement.style.setProperty('--overflow', 'hidden')
    },

    methods: {
        async createTask() {
            try {
                const response = await this.$axios.$post('/tasks/', {
                    short_name: this.task.name,
                    prompt: this.task.prompt,
                })
                this.taskData.push({
                    id: response.newTaskId,
                    short_name: this.task.name,
                    prompt: this.task.prompt,
                    image_count: 0,
                    observer_count: 0,
                    progress: 0
                })
                this.task.name = null
                this.task.prompt = null
            } catch (err) {
                console.log(err)
            }
        },
        editTask(task) {
            this.taskToEdit = task
        },
        finishTaskEdit(auxData) {
            const index = this.taskData.findIndex(task => task.id == this.taskToEdit.id)
            this.taskData[index].observer_count = auxData.observers
            this.taskData[index].image_count = auxData.images
            this.taskToEdit = null
        },
        async deleteTask(task) {
            console.log('deleteTask')
            try {
                await this.$axios.$post('/tasks/delete', {
                    id: task.id
                })
                const index = this.taskData.findIndex(curTask => curTask.id === task.id)
                this.taskData.splice(index, 1)
            } catch (err) {
                console.log(err)
            }
        },
        async getTasksTable() {
            try {
                const response = await this.$axios.$get('/tasks/table')
                this.taskData = response
            } catch (err) {
                console.error(err);
            }
        }

    }
}
</script>

<style lang='scss'>

section.tasks-controller {
    padding-top: 0;
}

input:focus + span {
    color: hsl(0, 0%, 4%);
}

</style>