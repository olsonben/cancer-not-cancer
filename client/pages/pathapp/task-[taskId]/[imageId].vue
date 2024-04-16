<script setup>
const taskQueue = useTaskQueue()
const curImage = taskQueue.currentImage
console.log(curImage.value)
watch(curImage, () => {
    console.log('curImage Changed')
    console.log(curImage.value)
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