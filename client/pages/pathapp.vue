<script setup>
const api = useApi()

// get tasks assigned to user
const { data: tasks } = await api.straightGET('/tasks/')


const allTasks = useState('allTasks',  () => tasks)

</script>
<template>
    <NuxtPage />
</template>