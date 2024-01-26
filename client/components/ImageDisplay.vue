<script setup>
// DEFAULT VALUES
const CHIPSIZE = 128
const FOVSIZE = 911
const ZOOMSCALE = 4

const props = defineProps({
    imageUrl: { type: String, required: true },
    chipSize: { type: Number, default: 128 },
    fovSize: { type: Number },
    zoomScale: { type: Number }
})

const numberValidator = (value, defaultValue) => {
    if (value !== null && value >= 0) {
        return value
    } else {
        return defaultValue
    }
}

const chipSize = computed(() => numberValidator(props.chipSize, CHIPSIZE))
const fovSize = computed(() => numberValidator(props.fovSize, FOVSIZE))
const zoomScale = computed(() => numberValidator(props.zoomScale, ZOOMSCALE))
const imageUrl = computed(() => props.imageUrl)

const showImage = ref(true)
const zoom = ref(false)

const roiRatio = computed(() => {
    return chipSize.value / fovSize.value
})
const showRoiBox = computed(() => !(chipSize.value > 0))

const cssVars = computed(() => {
    return {
        '--roi-ratio': roiRatio.value,
        '--zoom-scale': zoomScale.value
    }
})

</script>

<template>
    <div v-if="showImage" class="zoom-box" :class="{'zoom': zoom }" @click="zoom = !zoom" :style="cssVars">
        <div class='roi' :class="{ 'is-hidden': showRoiBox }"></div>
        <img :src='imageUrl' :alt='imageUrl'/>
    </div>
</template>

<style lang="scss" scoped>
.zoom-box {
    width: 100%;
    height: 100%;
    position: relative;

    /** Image zooming */
    transition-property: transform;
    transition-duration: 0.5s;
    transition-timing-function: ease-out;

    &.zoom {
        transform: scale(var(--zoom-scale));
    }    

    img {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }

    /**
    * ROI is a white box centered in the image
    *
    * Important for .roi to be `position: absolute` and parent `position: relative`
    * That way the overlay will be centered on the image.
    */
    .roi {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;

        // ROI fallback
        width: 14.05%;
        height: 14.05%;
        // ROI most accurate
        width: calc(100% * var(--roi-ratio));
        height: calc(100% * var(--roi-ratio));
        margin: auto;
        border: 1px solid white;
        pointer-events: none;
    }
}
</style>