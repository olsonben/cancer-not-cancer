<script setup>
import { watch } from 'vue';

const curImage = useState('currentImage')
const resetTrigger = ref(false)

</script>

<template>
    <ImageDisplay
        :imageUrl="curImage?.imageUrl"
        :altText="curImage?.name"
        :chipSize="curImage?.chipSize"
        :fovSize="curImage?.fovSize"
        :zoomScale="curImage?.zoomScale"
        :resetTrigger="resetTrigger"
    />
</template>

<style lang='scss' scoped>
</style>