<script setup>
const curImage = useState('currentImage')

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