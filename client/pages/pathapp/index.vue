<script setup>
useHead({title: `Task Picker`})
</script>

<template>
    <div class="container p-5">
        <div class="title">Pick a task</div>
        <div class=''>
            <ClientOnly fallback-tag="div">
                <TaskPickerList />
                <template #fallback>
                    <div class="box">Loading tasks...</div>
                </template>
            </ClientOnly>
        </div>
    </div>
</template>