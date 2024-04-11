<script setup>
const allTasks = useState('allTasks')

if (!allTasks.value[0]) {
    console.log('You have no assigned tasks.')
}
</script>

<template>
    <NuxtLink class="box" v-for="task in allTasks" :to="`/pathapp/task-${task.id}`">
        <div class="">
            <h4 class="title is-4">{{ task.prompt }}</h4>
            <h6 class="subtitle is-6">Task Id: {{ task.id }} - {{ task.short_name }}</h6>
        </div>
    </NuxtLink>
</template>

<style lang="scss" scoped>
</style>