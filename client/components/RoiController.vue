<script setup>
const placeholder = usePlaceholder()

const receptiveField = ref(911)
const chipSize = ref(128)
const dataUrlPlaceholder = ref(placeholder.generate(receptiveField.value))
const percentage = computed({
    get () {
        const p = chipSize.value / receptiveField.value * 100
        return p
    },
    set (newValue) {
        chipSize.value = receptiveField.value * (newValue/100)
    }
})
watch(receptiveField, async (newSize, oldSize) => {
    if (newSize !== oldSize) {
        dataUrlPlaceholder.value = placeholder.generate(newSize)
    }
})
const zoom = ref(false)

</script>

<template>
    <div class="has-text-danger has-text-weight-semibold">WARNING: These settings are not currently saved and will not affect the task.</div>
    <!-- <div class="title is-5">Chip size</div> -->
    <div class="subtitle is-6">If you don't want a chip size box, set to 0.</div>
    <!-- <div class="subtitle is-6">This percentage is based on a image size of {{ receptiveField }} pixels.</div> -->

    <div class="slide-container">
        
        <div class="field">
            <label class="label">Chip Size</label>
            <div class="control">
                <input class="input" type="text" v-model="chipSize" placeholder="ROI size">
                <p class="help">Region of interest size in pixels</p>
            </div>
        </div>
        
        

        <div class="field width-limiter">
            
            <div class="field-body">
                <div class="field">
                    <input type="range" id="roi" name="roi" min="0" :max="receptiveField" v-model="chipSize" class="slider"/>
                    <!-- <p class="help" for="roi">Percentage: {{ (Math.round(percentage * 100) / 100).toFixed(2) }}%</p> -->
                </div>
            </div>

            <div class="image-container" @click="zoom = !zoom">
                <div class="zoom-box" :class="{ 'zoom': zoom }">
                    <div v-if="chipSize > 0" class='roi has-text-white is-size-7' :style="{ 'height': `${percentage}%`, 'width': `${percentage}%` }">
                        <div class="down-shift">{{ chipSize }}x{{ chipSize }}</div>
                    </div>
                    <img :src="dataUrlPlaceholder" alt="placeholder image" >
                </div>
            </div>
        </div>
        <div class="field">
            <label class="label">Receptive Field Size</label>
            <div class="control">
                <input class="input" type="text" v-model="receptiveField" placeholder="slide size">
                <p class="help">Image size in pixels</p>
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

.width-limiter {
    width: 60%;
}

// TODO: move to main.scss as this can be the same style as the pathapp slide css
.image-container {
    position: relative;
    // width: 60%;
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

            .down-shift {
                transform: translate(0.125rem, 0.5rem);
            }
        }
    }
}

</style>

