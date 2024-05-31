<script setup>
import { useTaskQueue } from '@/store/taskQueue'

const taskQueue = useTaskQueue()
const curImage = computed(() => taskQueue.currentImage)

</script>

<template>
    <ClientOnly>
        <ImageDisplay
            :imageUrl="curImage.imageUrl"
            :altText="curImage.name"
            :chipSize="curImage.chipSize"
            :fovSize="curImage.fovSize"
            :zoomScale="curImage.zoomScale"
        />
    </ClientOnly>
</template>

<style lang='scss' scoped>
</style>