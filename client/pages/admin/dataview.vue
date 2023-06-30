<template>
    <div>
        <!-- Main dataview -->
        <section class='section dataview'>
            <h1 class='title'>Data View</h1>
            <div>
                <div class='task-title'><strong>Task:</strong> Is the ROI cancer?</div>
                <div class="task-stats">
                    <ul>
                        <li>Total: {{ total }}</li>
                        <li>Yes: {{ yes }}%</li>
                        <li>No: {{ no }}%</li>
                        <li>Maybe: {{ maybe }}%</li>
                    </ul>
                </div>
                <div class="box table-container table-limiter">
                    <Table :tableData="userTableData" />
                </div>
                <div class="box table-container table-limiter">
                    <Table :tableData="imageTableData" />
                </div>
            </div>
        </section>
    </div>
</template>

<script>
const percentage = (part, total) => {
    const percent = part/total*100
    return percent.toFixed(2)
}

export default {
    data() {
        return {
            data: {},
            total: 0,
            yes: 0,
            no: 0,
            maybe: 0,
            userChart: [],
            imageChart: []
        }
    },
    computed: {
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
        }
    },
    created() {
        this.lookupData()
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
        async lookupData() {
            // get general task data
            try {
                const response = await this.$axios.get('/getData')
                this.data = response.data
            } catch (err) {
                console.error(err);
            }

            // get task data grouped by users
            try {
                const response = await this.$axios.get('/getDataPerUsers')
                this.userChart = response.data
            } catch (err) {
                console.error(err);
            }

            // get task data grouped by images
            try {
                const response = await this.$axios.get('/getDataPerImages')
                this.imageChart = response.data
            } catch (err) {
                console.error(err);
            }
        }
    }
}
</script>

<!-- Cannot scope this for some reason -->
<style lang='scss'>
.dataview {
    // display: flex;
    // flex-direction: column;
}

.box.table-container {
    padding: 0.5rem;
}

.table-limiter {
    // th {
    //     position: sticky;
    //     top: 0px;
    // }

    // tbody {
    //     overflow: auto;
    //     max-height: 150px;
    // }
}

.task-title {
    color: hsl(0deg, 0%, 29%);
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.25;
    width: 100%;
    border-bottom: 1px solid hsl(0deg, 0%, 82%);
}

.task-stats {
    padding: 0.7rem;

    ul {
        columns: 2;
    }
}
</style>