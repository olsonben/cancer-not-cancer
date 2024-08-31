<script setup>
const placeholder = usePlaceholder()
const currentTask = useState('currentTask')

const receptiveField = computed({
    get() {
        return currentTask.value.task.fov_size || 911
    },
    set(val) {
        currentTask.value.task.fov_size = val
    }
})

const chipSize = computed({
    get() {
        const chip_size = currentTask.value.task.chip_size
        return chip_size === null ? 128 : chip_size
    },
    set(val) {
        currentTask.value.task.chip_size = val
    }
})

const zoomScale = computed({
    get() {
        return currentTask.value.task.zoom_scale || 4
    },
    set(val) {
        currentTask.value.task.zoom_scale = val
    }
})

// simple boolean to track zoom toggle
const zoom = ref(false)

// generated placeholder image
const dataUrlPlaceholder = ref(placeholder.generate(receptiveField.value))

// this is the roi size to fov size ratio
const roiPercentage = computed(() => chipSize.value / receptiveField.value * 100)

// for inline zoom css
const zoomStyle = computed(() => {
    let scale = '1'
    // TODO: consider adding validation for values less than 1
    if (zoom.value) {
        scale = String(zoomScale.value)
    }

    return { transform: `scale(${scale})` }
})


// if the receptiveField changes, update placeholder image size
watch(receptiveField, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        dataUrlPlaceholder.value = placeholder.generate(newValues)
    }
})

</script>

<template>
    
    <div class="slide-container">
        
        <div class="field">
            <label class="label">Chip Size</label>
            <div class="control">
                <input class="input" type="text" v-model="chipSize" placeholder="ROI size">
                <p class="help">Region of interest size in pixels</p>
                <p class="help mt-0">To remove the roi, set chip size to 0.</p>
            </div>
        </div>

        <div class="field width-limiter">
            
            <div class="field-body">
                <div class="field">
                    <input type="range" id="roi" name="roi" min="0" :max="receptiveField" v-model="chipSize" class="slider"/>
                </div>
            </div>

            <div class="image-container" @click="zoom = !zoom">
                <div class="zoom-box" :style="zoomStyle">
                    <div v-if="chipSize > 0" class='roi has-text-white is-size-7' :style="{ 'height': `${roiPercentage}%`, 'width': `${roiPercentage}%` }">
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
        <div class="field">
            <label class="label">Click to Zoom Amount</label>
            <div class="control">
                <input class="input" type="text" v-model="zoomScale" placeholder="zoom amount">
                <p class="help">How much should the image enlarge when clicked.</p>
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

