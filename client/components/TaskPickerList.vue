<script setup>
const allTasks = useState('allTasks')

if (!allTasks.value[0]) {
    console.log('You have no assigned tasks.')
}
</script>

<template>
    <NuxtLink class="box" v-for="task in allTasks" :to="`/pathapp/task-${task.id}`">
        <div class="">
            <h5 class="title is-5">{{ task.prompt }}</h5>
            <h6 class="subtitle is-6">Task Id: {{ task.id }} - {{ task.short_name }}</h6>
        </div>
    </NuxtLink>
</template>

<style lang="scss" scoped>
</style>