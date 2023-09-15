<template>
    <div class="modal" v-bind:class="{ 'is-active': true }">
        <div class="modal-background" @click="cancelChanges"></div>
        <div class="modal-content">
            <div class="section">
                <div class="box p-5 smooth-height">
                    <div class="field">
                        <label class="label">Name</label>
                        <div class="control is-large ">
                            <input class="input is-large has-text-weight-bold" type="text" v-model="localTask.short_name">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Prompt</label>
                        <div class="control is-medium">
                            <textarea class="textarea has-text-weight-medium" v-model="localTask.prompt" />
                        </div>
                    </div>
                    <div class="task-edit-nav tabs is-boxed">
                        <ul>
                            <li :class="{ 'is-active': activeTab === 'observers' }" @click="activeTab = 'observers'"><a>Observers</a></li>
                            <li :class="{ 'is-active': activeTab === 'images' }" @click="activeTab = 'images'"><a>Images</a></li>
                        </ul>
                    </div>
                    <div v-if="activeTab === 'observers'" class="field">
                        <!-- <label class="label">Observers</label> -->
                        <Adder :tags="observers" @update="updateObservers" />
                    </div>
                    <div v-if="activeTab === 'images'" class="field">
                        <!-- <label class="label">Images</label> -->
                        <ImagePicker :files="root.contents" @report="report"/>
                    </div>
                    <div class="field is-grouped">
                        <p class="control">
                            <button class="button is-warning" @click="cancelChanges">Cancel</button>
                        </p>
                        <p class="control">
                            <button class="button is-success" @click="saveChanges">Save</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['task'],
    data() {
        return {
            activeTab: 'observers',
            localTask: Object.assign({}, this.task),
            observers: {
                applied: [],
                available: [],
            },
            root: {
                id: 0,
                name: 'root',
                contents: [],
                type: 'tag',
                selected: [],
            },
        }
    },
    async fetch() {
        try {
            const observers = await this.$axios.$get('/tasks/observers', {
                params: {
                    task_id: this.task.id
                }
            })
            for (const user of observers) {
                if (user.applied) {
                    this.observers.applied.push(user)
                } else {
                    this.observers.available.push(user)
                }
            }
            const images = await this.$axios.$get('/tasks/images', {
                params: {
                    task_id: this.task.id
                }
            })
            this.root.contents = images
        } catch (error) {
            console.error(error)
        }
    },
    computed: {
    },
    watch: {
    },
    methods: {
        async saveChanges() {
            try {
                const selectedImages = this.$common.getSelectedFiles(this.root)

                const [response, observerResponse, imageResponse] = await Promise.all([
                    this.$axios.$post('/tasks/update', {
                        id: this.localTask.id,
                        short_name: this.localTask.short_name,
                        prompt: this.localTask.prompt,
                    }),
                    this.$axios.$post('/tasks/observers', {
                        task_id: this.localTask.id,
                        observerIds: JSON.stringify(this.observers.applied.map(user => user.id)),
                    }),
                    this.$axios.$post('/tasks/images', {
                        task_id: this.localTask.id,
                        imageIds: JSON.stringify(selectedImages),
                    })
                ])

                this.task.short_name = this.localTask.short_name
                this.task.prompt = this.localTask.prompt

                this.$emit('save', {
                    observers: this.observers.applied.length,
                    images: selectedImages.length
                })
            } catch (err) {
                console.log(err)
            }
        },
        cancelChanges() {
            console.log('changes cancelled')
            this.$emit('cancel')
        },
        updateObservers(observersData) {
            this.observers.applied = observersData.applied
            this.observers.available = observersData.available
        },
        report() {
            console.log('Files selected')
            console.log(this.$common.getSelectedFiles(this.root))
        }
    }
}

</script>


<style lang='scss' scoped>
// .modal-background {
//     // background-color: white;
// }
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
    transition: height 0.5s ease;
}
</style>