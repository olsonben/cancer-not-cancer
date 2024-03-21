<template>
    <div>
        <!-- Main dataview -->
        <section class='section dataview'>
            <h1 class='title'>Stats View</h1>
            <div>
                <div class='controls level'>
                    <div class='task-picker level-left'>
                        <strong>Task:</strong> <div class="select is-medium">
                            <select v-model="selectedTask">
                                <option v-for="task in tasks" :value="task.id">{{ task.prompt }}</option>
                            </select>
                        </div>
                        <div v-show="selectedTask" class="buttons is-center pl-5">
                            <button class="button is-success" type="button" @click="exportTask">
                                <span class="icon"><fa-icon :icon="['fas', 'download']" /></span>
                            </button>
                        </div>
                    </div>
                    <Userview class="level-right" v-if='isAdmin' v-model:userId="userId" :label="'Created by:'"/>
                </div>
                <div class="task-stats">
                    <ul>
                        <li>Total: {{ total }}</li>
                        <li>Yes: {{ yes }}%</li>
                        <li>No: {{ no }}%</li>
                        <li>Maybe: {{ maybe }}%</li>
                    </ul>
                </div>
                <div class="box">
                    <div class="table-container table-limiter">
                        <Table :tableData="userTableData" />
                    </div>
                </div>
                <div class="box">
                    <div class="table-container table-limiter">
                        <Table :tableData="imageTableData" />
                    </div>
                </div>
            </div>
        </section>
        <Export v-if="exportData != null" :task="exportData" @done="exportData = null" />
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useUserStore } from '~/store/user'
const api = useApi()

const percentage = (part, total) => {
    const percent = part/total*100
    return percent.toFixed(2)
}

const theAllTask = () => {
    return [{
        'id': null,
        'prompt': 'All',
        'short_name': 'all'
    }]
}

export default {
    data() {
        return {
            tasks: theAllTask(),
            selectedTask: null,
            data: {},
            total: 0,
            yes: 0,
            no: 0,
            maybe: 0,
            userChart: [],
            imageChart: [],
            userId: null,
            exportData: null
        }
    },
    computed: {
        ...mapState(useUserStore, ['isAdmin']),
        userTableData() {
            const tableBodyData = []
            for (const user of this.userChart) {
                const yes = percentage(user.yes, user.total)
                const no = percentage(user.no, user.total)
                const maybe = percentage(user.maybe, user.total)
                tableBodyData.push({
                    'user_id': user.user_id,
                    'fullname': user.fullname,
                    'total': user.total,
                    'yes': `${yes}%`,
                    'no': `${no}%`,
                    'maybe': `${maybe}%`,
                })
            }
            return {
                columns: ['User', 'Total', 'Yes', 'No', 'Maybe'],
                order: ['fullname', 'total', 'yes', 'no', 'maybe'],
                indexProp: 'user_id',
                bodyData: tableBodyData,
            }
        },
        imageTableData() {
            const tableBodyData = []
            for (const image of this.imageChart) {
                const yes = percentage(image.yes, image.total)
                const no = percentage(image.no, image.total)
                const maybe = percentage(image.maybe, image.total)
                tableBodyData.push({
                    'image_id': image.image_id,
                    'total': image.total,
                    'yes': `${yes}%`,
                    'no': `${no}%`,
                    'maybe': `${maybe}%`,
                })
            }
            tableBodyData.sort((a,b) => b.total - a.total)
            return {
                columns: ['Image', 'Total', 'Yes', 'No', 'Maybe'],
                order: ['image_id', 'total', 'yes', 'no', 'maybe'],
                indexProp: 'image_id',
                bodyData: tableBodyData,
            }
        }
    },
    watch: {
        data(newData) {
            const t = newData.total
            this.total = newData.total,
            this.yes = percentage(newData.yes, t),
            this.no = percentage(newData.no, t),
            this.maybe = percentage(newData.maybe, t)
        },
        selectedTask(newTaskId) {
            this.lookupData()
        },
        userId(newUserID) {
            // If user id changes, we need to pull task associated with that id.
            this.getTasks()
            // If the selectedTask isn't on the all/default/null, reset it
            // and since selectedTask is being watch, we use this if to update
            // the data if the task didn't change but the user did.
            if (this.selectedTask) {
                this.selectedTask = null
            } else {
                this.lookupData()
            }
        }
    },
    created() {
        this.getTasks()
        this.lookupData()
    },

    methods: {
        async lookupData() {
            // get general task data
            try {
                const { response } = await api.GET('/data/', {
                    task_id: this.selectedTask,
                    user_id: this.userId
                })
                this.data = response.value
            } catch (err) {
                console.error(err);
            }

            // get task data grouped by users
            try {
                const { response } = await api.GET('/data/perUsers', {
                    task_id: this.selectedTask,
                    user_id: this.userId
                })
                this.userChart = response.value
            } catch (err) {
                console.error(err);
            }

            // get task data grouped by images
            try {
                const { response } = await api.GET('/data/perImages', {
                    task_id: this.selectedTask,
                    user_id: this.userId
                })
                this.imageChart = response.value
            } catch (err) {
                console.error(err);
            }
        },
        async getTasks() {
            try {
                const { response } = await api.GET('/tasks/owned', {
                    user_id: this.userId
                })
                const tasks = theAllTask().concat(response.value)
                this.tasks = tasks
            } catch (err) {
                console.error(err);
            }
        },
        exportTask() {
            const task = this.tasks.find((t) => t.id === this.selectedTask)
            console.log(`Export Task ${task.id}`)
            this.exportData = task
        },
    }
}
</script>

<style lang='scss' scoped>
.box {
    padding: 0.5rem;
}

.table-container {
    overflow: auto;
    border: 1px solid hsl(0deg, 0%, 86%);
}

// limit table height, so tables are scrollable instead of a long page
.table-limiter {
    max-height: 500px;
    
    table {
        border-collapse: separate;
    }

    thead {
        position: sticky;
        top: 0px;
        background-color: white;
        border: 1px solid hsl(0deg, 0%, 86%);
    }
}
.controls {
    color: hsl(0deg, 0%, 29%);
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.5;
    width: 100%;
    border-bottom: 1px solid hsl(0deg, 0%, 82%);

    strong {
        padding-top: 0.8rem;
        display: inline-block;
    }
}

.task-stats {
    padding: 0.7rem;

    ul {
        columns: 2;
    }
}
</style>