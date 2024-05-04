<script setup>
const api = useApi()

// get tasks assigned to user
const { response: tasks } = await api.GET('/tasks/')
const allTasks = useState('allTasks',  () => tasks.value)

</script>
<template>
    <NuxtPage />
</template>