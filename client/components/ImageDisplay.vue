<script setup>
// DEFAULT VALUES
const CHIPSIZE = 128
const FOVSIZE = 911
const ZOOMSCALE = 4

const props = defineProps({
    imageUrl: { type: String, required: false },
    altText: { type: String },
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
const altText = computed(() => props.altText ?? props.imageUrl)

const showImage = ref(true)
const zoom = ref(false)
const translate = ref('translate(0px, 0px)')

const zoomHandler = (event) => {
    if (zoom.value) {
        translate.value = 'translate(0px, 0px)'
        zoom.value = false
        return
    }
    const rect = event.target.getBoundingClientRect()
    const { width: imgWidth, height: imgHeight } = rect
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log(x, y)
    const maxLimit = (imgWidth / zoomScale.value) * 1.5
    const minLimit = maxLimit * -1
    const imgOrigin = { x: imgWidth/2, y: imgHeight/2 }
    let transX = imgOrigin.x - x
    transX = Math.max(minLimit, transX)
    transX = Math.min(maxLimit, transX)
    let transY = imgOrigin.y - y
    transY = Math.max(minLimit, transY)
    transY = Math.min(maxLimit, transY)

    console.log(`translate(${transX}px, ${transY}px)`)
    translate.value = `translate(${transX}px, ${transY}px)`
    zoom.value = true
}

const roiRatio = computed(() => {
    return chipSize.value / fovSize.value
})
const showRoiBox = computed(() => !(chipSize.value > 0))

const cssVars = computed(() => {
    return {
        '--roi-ratio': roiRatio.value,
        '--zoom-scale': zoomScale.value,
        '--translate': translate.value
    }
})

watch(imageUrl, (newUrl, oldUrl) => {
    // console.log('new image url:', newUrl)
})

</script>

<template>
    <div v-if="showImage" class="zoom-box" :class="{'zoom': zoom }" @click="zoomHandler" :style="cssVars">
        
        <div v-if="!imageUrl" class="loading"></div>
        <template v-else>
            <div class='roi' :class="{ 'is-hidden': showRoiBox }"></div>
            <img :key="imageUrl" :src='imageUrl' :alt='altText'/>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.zoom-box {
    width: 100%;
    height: 100%;
    position: relative;
    // background-color: #cea3c5;
    // background-color: #BF73B3;
    background-color: #D9A7D0;

    /** Image zooming */
    transition-property: transform;
    transition-duration: 0.5s;
    transition-timing-function: ease-out;

    &.zoom {
        transform: scale(var(--zoom-scale)) var(--translate);
    }    

    img {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }

    /**
    * Loading Animation
    */
    $circle-size: 0.25;
    $center-trans: calc((1 - $circle-size) / (2 * $circle-size));
    $center-trans-p: calc(100% * $center-trans);
    .loading {
        /* Border size and color */
        border: 8px solid #ffffff;
        /* Creates a circle */
        border-radius: 50%;
        /* Circle size */
        height: calc(100% * $circle-size);
        width: calc(100% * $circle-size);
        /* Use transparent borders to define opening (more transparent = larger opening) */
        // border-top-color: transparent;
        border-left-color: transparent;
        opacity: 75%;
        /* Use transform to rotate to adjust where opening appears */
        // transform: translate($center-trans-p, $center-trans-p)  rotate(90deg) 
        animation: rotate 1.5s infinite linear;
    }

    @keyframes rotate {
        0% { transform: translate($center-trans-p, $center-trans-p) rotate(0deg);}
        100% { transform: translate($center-trans-p, $center-trans-p) rotate(360deg);}
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