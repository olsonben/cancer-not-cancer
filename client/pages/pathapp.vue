<script setup>
const api = useApi()

const allTasks = useState('allTasks',  () => [])

if (import.meta.client) {
    // get tasks assigned to user
    const tasks = await api.$fetch('/tasks/')
    allTasks.value = tasks
}

</script>
<template>
    <NuxtPage />
</template>