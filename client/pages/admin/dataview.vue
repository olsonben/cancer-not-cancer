<script setup>
useHead({
    title: 'Admin - Stats'
})
import { useUserStore } from '~/store/user'

const api = useApi()
const userStore = useUserStore()

const isAdmin = computed(() => userStore.isAdmin)

const percentage = (part, iTotal) => {
    const percent = part/iTotal*100
    return percent.toFixed(2)
}

const theAllTask = {
    'id': 0,
    'prompt': 'All',
    'short_name': 'all'
}


const selectedTask = ref(0)
const userId = ref(null)
const { data: ownedTasks } = await api.straightGET('/tasks/owned', { userId }, null, null, [userId])
// TODO: put the following in a asyncData/promise.all
const { data } = await api.straightGET('/data/', { userId, selectedTask }, null, null, [userId, selectedTask])
const { data: userChart } = await api.straightGET('/data/perUsers', { userId, selectedTask }, null, null, [userId, selectedTask])
const { data: imageChart } = await api.straightGET('/data/perImages', { userId, selectedTask }, null, null, [userId, selectedTask])


const tasks = computed(() => [theAllTask, ...ownedTasks.value])
const total = computed(() => data.value.total)
const yes = computed(() => percentage(data.value.yes, data.value.total))
const no = computed(() => percentage(data.value.no, data.value.total))
const maybe = computed(() => percentage(data.value.maybe, data.value.total))


const exportData = computed(() => tasks.value.find((t) => t.id === selectedTask.value))
const showExport = ref(false)


const userTableData = computed(() => {
    console.log(userChart.value)
    const tableBodyData = []
    for (const user of userChart.value) {
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
        tableId: `userTable-${selectedTask.value}`,
        columns: ['User', 'Total', 'Yes', 'No', 'Maybe'],
        order: ['fullname', 'total', 'yes', 'no', 'maybe'],
        indexProp: 'user_id',
        bodyData: tableBodyData,
    }
})
  
const imageTableData = computed(() => {
    const tableBodyData = []
    for (const image of imageChart.value) {
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
})


</script>

<template>
    <div>
        <!-- Main dataview -->
        <section class='section dataview'>
            <h1 class='title'>Stats View</h1>
            <div>
                <div class='controls level'>
                    <div class='task-picker level-left'>
                        <strong>Task:</strong> <div class="select is-medium">
                            <select v-if="tasks.length" v-model="selectedTask" key="selectedTask" >
                                <option v-for="task in tasks" :value="task.id" :key="`selectTaskOption${task.id}`">{{ task.prompt }}</option>
                            </select>
                        </div>
                        <div v-show="selectedTask" class="buttons is-center pl-5">
                            <button class="button is-success" type="button" @click="showExport=true">
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
                        <Table :tableData="userTableData" key="userTable" />
                        <!-- <Table :tableData="userTableData" :key="`userTable-${selectedTask}`" /> -->
                    </div>
                </div>
                <div class="box">
                    <div class="table-container table-limiter">
                        <Table :tableData="imageTableData" />
                    </div>
                </div>
            </div>
        </section>
        <Export v-if="showExport" :task="exportData" @done="showExport=false" />
    </div>
</template>

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