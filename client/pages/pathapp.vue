<script setup>
const api = useApi()

// get tasks assigned to user
const { data: tasks } = await api.GET('/tasks/')


const allTasks = useState('allTasks',  () => tasks)

</script>
<template>
    <NuxtPage />
</template>