<script setup>
useHead({title: `Task Picker`})
</script>

<template>
    <div class="container p-5">
        <div class="title">Pick a task</div>
        <div class=''>
            <TaskPickerList />
        </div>
    </div>
</template>