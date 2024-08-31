<template>
    <div class="adder">
        <div class="columns">
            <div class="column" @drop="onDrop($event, 'applied')" @dragover.prevent @dragenter.prevent>
                <h2 class="has-text-weight-semibold">Active</h2>
                <ul>
                    <li
                        v-for="tag in applied"
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
                        v-for="tag in available"
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

<script setup>
// const dummyTagsData = [
//         { id: 1, name: "Tag A", applied: 1 },
//         { id: 2, name: "Tag B", applied: 1 },
//         { id: 3, name: "Tag C", applied: 0 },
//         { id: 4, name: "Tag D", applied: 0 },
// ]

// Technically this could just be a prop, but defineModel returns a ref
const tags = defineModel('tags', {
    type: Array,
    default: null,
})

const applied = computed(() => {
    return tags.value.filter((tag) => tag.applied === 1)
})

const available = computed(() => {
    return tags.value.filter((tag) => tag.applied === 0)
})

const setAppliedById = (id, appliedValue = 0) => {
    const index = tags.value.findIndex((tag) => tag.id === id)
    if (index !== -1) {
        tags.value[index].applied = appliedValue
    }
}

const onDrop = (event, column) => {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    if (column !== data.type) {
        if (column === 'applied') {
            setAppliedById(data.tag.id, 1)
        } else {
            setAppliedById(data.tag.id, 0)
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