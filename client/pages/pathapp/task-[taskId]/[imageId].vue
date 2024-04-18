<script setup>
import { useTaskQueue } from '@/store/taskQueue'
const taskQueue = useTaskQueue()
const curImage = unref(taskQueue.currentImage)

</script>

<template>
    <ImageDisplay
        :imageUrl="curImage?.imageUrl"
        :altText="curImage?.name"
        :chipSize="curImage?.chipSize"
        :fovSize="curImage?.fovSize"
        :zoomScale="curImage?.zoomScale"
    />
</template>

<style lang='scss' scoped>
</style>