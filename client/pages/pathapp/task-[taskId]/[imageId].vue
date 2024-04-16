<script setup>
import { useTaskQueue } from '@/store/taskQueue'
const taskQueue = useTaskQueue()
const curImage = taskQueue.currentImage

watch(curImage, () => {
    console.log('curImage Changed')
    console.log(curImage)
})
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