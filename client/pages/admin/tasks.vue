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
                                <input class="input" type="text" placeholder="name" v-model="task.name">
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
                                <input class='button is-primary' type="submit" value="Create" />
                            </p>
                            </div>
                        </div>
                    </div>
                   
                </form>
            </div>
            <div class="py-2">
                <div class='box'>
                    <h3>Existing Tasks</h3>
                    <table class="table is-striped is-narrow">
                        <thead>
                            <th v-for="colName in columns">{{ colName }}</th>
                        </thead>
                        <tbody>

                            <Row v-for="row in taskData" :key="row[indexProp]" :class="{ 'is-selected': false }"  :row="row" :order="order"/>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
</template>

<script>

export default {
    data() {
        return {
            task: {
                name: null,
                prompt: null,
            },
            columns: ['Name', 'Prompt', 'Image Count', 'User Count', 'Progress', ''],
            order: ['short_name', 'prompt', 'image_count', 'user_count', 'progress'],
            indexProp: 'id',
            taskData: [
                {
                    'id': 1,
                    'short_name': 'task 1',
                    'prompt': 'Is this my question?',
                    'image_count': 54,
                    'user_count': 3,
                    'progress': '<progress max="100" class="progress is-small is-primary" value="45">45</progress>'
                },
                {
                    'id': 2,
                    'short_name': 'another_task_beta_check_240623',
                    'prompt': 'Does this have alpha 1 marker properties?',
                    'image_count': 212,
                    'user_count': 6,
                    'progress': '<progress max="100" class="progress is-small is-primary" value="72">72</progress>'
                }
            ],
        }
    },
    computed: {
    },
    watch: {
    },
    created() {
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
        createTask() {
            console.log('Submit task')
            console.log(this.task)
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