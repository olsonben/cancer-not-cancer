<script setup>
const swipe = useSwipe(document)

const imageContainerStyle = computed(() => {
    // const xDiff = this.xMove !== null ? this.xMove - this.xDown : 0
    // const yDiff = this.xMove !== null ? Math.abs(this.xMove - this.xDown) * -1 : 0
    // // the numbers -6 and -12 are aesthetically chosen
    // const yAmount = yDiff / -6
    // const rotation = this.percent * -12

    const xDiff = 0
    const yDiff = 0
    // the numbers -6 and -12 are aesthetically chosen
    const yAmount = yDiff / -6
    const rotation = 0 * -12

    return {
        transform: `translate(${xDiff}px, ${yAmount}px) rotate(${rotation}deg)`
    }
})

onMounted(() => {
    console.log('ImageSwipe mounted')
    swipe.activate()
})
onUnmounted(() => {
    swipe.deactivate()
})
</script>

<template>
    <div class="image-container" :style="imageContainerStyle">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.image-container {
    position: relative;
    width: 100%;
    // TODO: Figure out how to handle rectangular images and their ROIs
    height: calc(50vh - $block-margin - $block-margin);
    line-height: 0;
    overflow: hidden;


    // transform: translate(var(--x-diff), calc(var(--y-diff) / -6)) rotate(calc( var(--rot-diff) * -12deg));

    @include for-size(mobile) {
        height: calc(100vw - $block-margin - $block-margin);
    }

} 

</style>