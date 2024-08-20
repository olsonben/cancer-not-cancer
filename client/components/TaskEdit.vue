<script setup>
const api = useApi()
const fileTools = useFileTools()
const Adder = resolveComponent('Adder')
const ImagePicker = resolveComponent('ImagePicker')
const RoiSettings = resolveComponent('RoiSettings')
const ContentEditor = resolveComponent('ContentEditor')

const currentTask = useState('currentTask')
const shortName = computed({
    get() {
        return currentTask.value.task.short_name
    },
    set(val) {
        currentTask.value.task.short_name = val
    }
})
const prompt = computed({
    get() {
        return currentTask.value.task.prompt
    },
    set(val) {
        currentTask.value.task.prompt = val
    }
})

const observers = computed({
    get() {
        return currentTask.value.observers
    }
})

const imageContent = computed(() => {
    return currentTask.value.images
})
const report = () => {
    console.log('Files selected')
    const root = {
        id: 0,
        name: 'root',
        contents: currentTask.value.images,
        type: 'tag',
        selected: [],
    }

    console.log(fileTools.getSelectedFiles(currentTask.value.images))
}


const annotationGuide = computed({
    get() {
        return currentTask.value.guide
    }
})
const updateGuide = (guideContent) => {
    currentTask.value.guide = guideContent
}

const activeTab = ref('observers')
const tabs = computed(() => {
    return [
        {
            name: 'observers',
            label: "Observers",
            component: Adder,
            props: { 'tags': observers.value },
            events: {}
        },
        {
            name: 'images',
            label: "Images",
            component: ImagePicker,
            props: { files: imageContent.value },
            events: { report: report }

        },
        {
            name: 'roi',
            label: "ROI",
            component: RoiSettings,
            props: { },
            events: { }

        },
        {
            name: 'guide',
            label: "Annotation Guide",
            component: ContentEditor,
            props: { content: annotationGuide.value },
            events: { 'update:content': updateGuide }

        }
    ]
})

</script>

<template>
    <!-- Name and Prompt update fields -->
    <div class="field">
        <label class="label">Name</label>
        <div class="control is-medium">
            <input class="input is-medium has-text-weight-bold" type="text" v-model="shortName">
        </div>
    </div>
    <div class="field">
        <label class="label">Prompt</label>
        <div class="control is-medium">
            <textarea class="textarea has-text-weight-medium prompt" v-model="prompt" />
        </div>
    </div>

    <!-- Tab navigation -->
    <div class="task-edit-nav tabs is-boxed">
        <ul>
            <li v-for="tab in tabs"
                :key="tab.name"
                :class="{ 'is-active': activeTab === tab.name }"
                @click="activeTab = tab.name">
                <a>{{ tab.label }}</a>
            </li>
        </ul>
    </div>

    <!-- Tab contents for editing the task -->
    <div class="field">
        <template v-for="tab in tabs">
            <component
                :is="tab.component"
                :key="tab.name"
                v-if="activeTab === tab.name"
                v-bind="tab.props"
                v-on="tab.events"
            />
        </template>
    </div>
</template>

<style lang='scss' scoped>
.prompt {
    min-height: 3.5rem;
}
.task-edit-nav.tabs {
    
    li {
        a {
            color: $primary;
        }

        &.is-active {
            a {
                color: $info;
                font-weight: bold;
                border-bottom-color: $info;
            }
        }

    }
}

.smooth-height {
    transition: max-height 0.5s ease;
    max-height: 100vh;
}

.tab-enter-active, .tab-leave-active {
    transition: max-height 0.5s ease;
    overflow: hidden;
}

.tab-enter-from, .tab-leave-to {
    max-height: 0;
    overflow: hidden;
}
</style>