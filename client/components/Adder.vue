<template>
    <div class="adder">
        <div class="columns">
            <div class="column" @drop="onDrop($event, 'applied')" @dragover.prevent @dragenter.prevent>
                <h2 class="has-text-weight-semibold">Active</h2>
                <ul>
                    <li
                        v-for="tag in localTags.applied"
                        :key="tag.id"
                        v-draggable="{ tag, type: 'applied', editable: true }"
                        class="tag is-info"
                    >
                        {{ tag.name }}
                    </li>
                </ul>
            </div>
            <div class="column" @drop="onDrop($event, 'available')" @dragover.prevent @dragenter.prevent>
                <h2 class="has-text-weight-semibold">Available</h2>
                <ul>
                    <li
                        v-for="tag in localTags.available"
                        :key="tag.id"
                        v-draggable="{ tag, type: 'available', editable: true }"
                        class="tag is-success"
                    >
                        {{ tag.name }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
// const dummyTagsData = {
//     applied: [
//         { id: 1, name: "Tag A" },
//         { id: 2, name: "Tag B" },
//     ],
//     available: [
//         { id: 3, name: "Tag C" },
//         { id: 4, name: "Tag D" },
//     ]
// }

export default {
    props: ['tags'],
    emits: ['update'],
    computed: {
        localTags() {
            return {
                applied: Array.from(this.tags.applied),
                available: Array.from(this.tags.available),
            }
        }
    },
    methods: {
        onDrop(event, column) {
            const data = JSON.parse(event.dataTransfer.getData('application/json'))
            if (column !== data.type) {
                if (column === 'applied') {
                    this.localTags.available = this.localTags.available.filter((obj) =>  {
                        return obj.id !== data.tag.id
                    })
                    this.localTags.applied.push(data.tag)
                } else {
                    this.localTags.applied = this.localTags.applied.filter((obj) => {
                        return obj.id !== data.tag.id
                    })
                    this.localTags.available.push(data.tag)
                }
                
                this.$emit('update', this.localTags)
            }
            
        }
    }
}
</script>

<style lang='scss' scoped>
.adder {

    .column {
        margin: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;

        ul {
            list-style: none;
            padding: 0;

            li {
                margin-bottom: 5px;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: move;
            }
        }
    }
}
</style>