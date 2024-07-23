<script setup>
const api = useApi()
const fileTools = useFileTools()
const Adder = resolveComponent('Adder')
const ImagePicker = resolveComponent('ImagePicker')
const RoiSettings = resolveComponent('RoiSettings')
const ContentEditor = resolveComponent('ContentEditor')

const taskData = defineModel()

// const shortName = toRef(taskData.value.task.short_name)
// watch(shortName, (newName, oldName) => {
//     console.log('Changing short name to:', shortName.value)
//     taskData.value.task.short_name = "test"
// })

watch(taskData, (newTask, oldTask) => {
    console.log('taskData has changed')
}, {deep:true})

// const resetTrigger = useState('resetTrigger')
// const saveTrigger = useState('saveTrigger')
// const dataStateChange = useState('dataStateChange')

const activeTab = ref('observers')

const observers = reactive({
    applied: [],
    available: [],
})

const root = reactive({
    id: 0,
    name: 'root',
    contents: [],
    type: 'tag',
    selected: [],
})

const annotationGuide = ref('')

const updateObservers = (observersData) => {
    // observers.applied = observersData.applied
    // observers.available = observersData.available
}

const report = () => {
    // console.log('Files selected')
    // console.log(fileTools.getSelectedFiles(root))
}

const updateRoi = (roiData) => {
    // localTask.value.chip_size = roiData.chipSize
    // localTask.value.fov_size = roiData.fovSize
    // localTask.value.zoom_scale = roiData.zoomScale
}

const updateGuide = (guideContent) => {
    // annotationGuide.value = guideContent
}

const tabs = computed(() => {
    return []
    // const chipSize = taskData.value.task.chip_size
    // const fovSize = taskData.value.task.fov_size
    // const zoomScale = taskData.value.task.zoom_scale
    // return [
    //     {
    //         name: 'observers',
    //         label: "Observers",
    //         component: Adder,
    //         props: { tags: observers },
    //         events: { update: updateObservers }
    //     },
    //     {
    //         name: 'images',
    //         label: "Images",
    //         component: ImagePicker,
    //         props: { files: root.contents },
    //         events: { report: report }

    //     },
    //     {
    //         name: 'roi',
    //         label: "ROI",
    //         component: RoiSettings,
    //         props: { chipSize, fovSize, zoomScale },
    //         events: { update: updateRoi }

    //     },
    //     {
    //         name: 'guide',
    //         label: "Annotation Guide",
    //         component: ContentEditor,
    //         props: { initialContent: annotationGuide.value },
    //         events: { update: updateGuide }

    //     }
    // ]
})

const saveChanges = async () => {
    // try {
    //     const selectedImages = fileTools.getSelectedFiles(root)

    //     const results = await Promise.allSettled([
    //         api.POST('/tasks/update', {
    //             id: localTask.value.id,
    //             short_name: localTask.value.short_name,
    //             prompt: localTask.value.prompt,
    //             chip_size: localTask.value.chip_size,
    //             fov_size: localTask.value.fov_size,
    //             zoom_scale: localTask.value.zoom_scale,
    //         }),
    //         api.POST('/tasks/observers', {
    //             task_id: localTask.value.id,
    //             observerIds: JSON.stringify(observers.applied.map(user => user.id)),
    //         }),
    //         api.POST('/tasks/images', {
    //             task_id: localTask.value.id,
    //             imageIds: JSON.stringify(selectedImages),
    //         }),
    //         api.POST(`/tasks/${localTask.value.id}/guide`, {
    //             content: annotationGuide.value
    //         })
    //     ])
    //     // TODO: clean up results logic
    //     // TODO: We shouldn't be updating a prop unless its a model
    //     // if (results[0].status === "fulfilled") {
    //         // NOTE: api.POST doesn't return a default success status anymore
    //         props.task.short_name = localTask.value.short_name
    //         props.task.prompt = localTask.value.prompt
    //         props.task.chip_size = localTask.value.chip_size
    //         props.task.fov_size = localTask.value.fov_size
    //         props.task.zoom_scale = localTask.value.zoom_scale
    //     // } else {
    //         // console.error("There was an error saving the task data.")
    //     // }

    //     const closeIfNoErrors = results.every((res) => (res.status === "fulfilled"))

    //     // Emit save event to update stats in task table.
    //     emit('save', {
    //         observers: results[1].status === "fulfilled" ? observers.applied.length : null,
    //         images: results[2].status === "fulfilled" ? selectedImages.length : null
    //     }, closeIfNoErrors)

    //     if (!closeIfNoErrors) {
    //         // TODO: turn this into a notification
    //         console.warn("Not all content was saved. To preserve current unsaved changes, the task editor has not been closed.")
    //     }

    // } catch (err) {
    //     console.error(err)
    // }
}

const cancelChanges = () => {
    // console.log('changes cancelled')
    // emit('cancel')
}

// TODO: don't use api.GET or use the data directly
// const [observersData, imagesData, guideData] = await Promise.all([
//     api.GET('/tasks/observers', {
//         task_id: props.task.id
//     }),
//     api.GET('/tasks/images', {
//         task_id: props.task.id
//     }),
//     api.GET(`/tasks/${props.task.id}/guide`)
// ])

// root.contents = taskData.value.images
// annotationGuide.value = taskData.value.guide
// for (const user of taskData.value.observers) {
//     if (user.applied) {
//         observers.applied.push(user)
//     } else {
//         observers.available.push(user)
//     }
// }

const resetChanges = () => {
    // console.log('TaskEdit resetChanges')
}

const savesaveChanges = () => {
    // console.log('TaskEdit saveChanges')
}

</script>

<template>
    <!-- Name and Prompt update fields -->
    <div class="field">
        <label class="label">Name</label>
        <div class="control is-medium">
            <input class="input is-medium has-text-weight-bold" type="text" v-model="taskData.task.short_name">
        </div>
    </div>
    <div class="field">
        <label class="label">Prompt</label>
        <div class="control is-medium">
            <textarea class="textarea has-text-weight-medium prompt" v-model="taskData.task.prompt" />
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