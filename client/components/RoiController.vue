<script setup>
const placeholder = usePlaceholder()

const slideSize = ref(911)
const roiSize = ref(128)
const dataUrlPlaceholder = ref(placeholder.generate(slideSize.value))
const percentage = computed({
    get () {
        const p = roiSize.value / slideSize.value * 100
        return p
    },
    set (newValue) {
        roiSize.value = slideSize.value * (newValue/100)
    }
})
watch(slideSize, async (newSize, oldSize) => {
    if (newSize !== oldSize) {
        dataUrlPlaceholder.value = placeholder.generate(newSize)
    }
})
const zoom = ref(false)

</script>

<template>
    <div class="title is-5">Choose the region of interest.</div>
    <div class="subtitle is-6">If you don't want an roi, set to 0.</div>

    <div class="slide-container">

        <div class="image-container" @click="zoom = !zoom">
            <div class="zoom-box" :class="{ 'zoom': zoom }">
                <div v-if="roiSize > 0" class='roi' :style="{ 'height': `${percentage}%`, 'width': `${percentage}%` }"></div>
                <img :src="dataUrlPlaceholder" alt="placeholder image" >
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label">Percentage</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <input type="range" id="roi" name="roi" min="0" max="100" v-model="percentage" class="slider"/>
                    <p class="help" for="roi">Percentage: {{ (Math.round(percentage * 100) / 100).toFixed(2) }}%</p>
                </div>
            </div>
        </div>
        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label">Size</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <input class="input" type="text" v-model="slideSize" placeholder="slide size">
                    <p class="help">Slide size in pixels</p>
                </div>
                <div class="field">
                    <input class="input" type="text" v-model="roiSize" placeholder="ROI size">
                    <p class="help">ROI size in pixels</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang='scss' scoped>
.slide-container {
    width: 100%;
}
.slider {
    -webkit-appearance: none;  /* Override default CSS styles */
    appearance: none;
    width: 100%; /* Full-width */
    height: 0.5rem; /* Specified height */
    border-radius: 0.25rem;
    background: $primary; /* Grey background */
    outline: none; /* Remove outline */
    opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
    -webkit-transition: .2s; /* 0.2 seconds transition on hover */
    transition: opacity .2s;
}

/* Mouse-over effects */
.slider:hover {
  opacity: 1; /* Fully shown on mouse-over */
}

@mixin slider-thumb {
    width: 1rem; /* Set a specific slider handle width */
    height: 1rem; /* Slider handle height */
    border-radius: 0.5rem;
    border: none;
    background: $success; /* Green background */
     cursor: pointer; /* Cursor on hover */
}

/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  @include slider-thumb;
}

.slider::-moz-range-thumb {
    @include slider-thumb;    
}


// TODO: move to main.scss as this can be the same style as the pathapp slide css
.image-container {
    position: relative;
    width: 60%;
    // height: calc(50vh - $block-margin - $block-margin);
    line-height: 0;
    overflow: hidden;

    @include for-size(mobile) {
        // height: calc(100vw - $block-margin - $block-margin);
    }

    .zoom-box {
        width: 100%;
        height: 100%;
        position: relative;

        /** Image zooming */
        transition-property: transform;
        transition-duration: 0.5s;
        transition-timing-function: ease-out;

        &.zoom {
            transform: scale(4);
        }

        img {
            object-fit: contain;
            width: 100%;
            height: 100%;
        }


        .roi {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;

            margin: auto;
            border: 1px solid white;
            pointer-events: none;
        }
    }
}

</style>

