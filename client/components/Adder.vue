<template>
    <div class="adder">
        <div class="columns">
            <div class="column" @drop="onDrop($event, 'applied')" @dragover.prevent @dragenter.prevent>
                <h2 class="has-text-weight-semibold">Active</h2>
                <ul>
                    <li
                        v-for="tag in appliedTags"
                        :key="tag.id"
                        v-draggable="{ tag, type: 'applied' }"
                        draggable
                        @dragstart="onDragStart"
                        @dragend="onDragEnd"
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
                        v-for="tag in availableTags"
                        :key="tag.id"
                        v-draggable="{ tag, type: 'available' }"
                        draggable
                        @dragstart="onDragStart"
                        @dragend="onDragEnd"
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
export default {
    data() {
        return {
            appliedTags: [
                { id: 1, name: "Tag A" },
                { id: 2, name: "Tag B" },
            ],
            availableTags: [
                { id: 3, name: "Tag C" },
                { id: 4, name: "Tag D" },
            ]
        }
    },
    methods: {
        onDragStart(event, tag, type) {
            // event.dataTransfer.setData('text/plain', JSON.stringify({tag, type}))
        },
        onDragEnd() {
            // update styling
        },
        onDrop(event, column) {
            const data = JSON.parse(event.dataTransfer.getData('application/json'))
            if (column !== data.type) {
                if (column === 'applied') {
                    this.appliedTags.push(data.tag)
                    this.availableTags = this.availableTags.filter((obj) =>  {
                        return obj.id !== data.tag.id
                    })
                } else {
                    this.availableTags.push(data.tag)
                    this.appliedTags = this.appliedTags.filter((obj) => {
                        return obj.id !== data.tag.id
                    })
                }
            }
            
        }
    }
}
</script>

<style lang='scss' scoped>
.adder {

    .column {
        // flex: 1;
        margin: 10px;
        // padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        // background-color: #f9f9f9;

        ul {
            list-style: none;
            padding: 0;

            li {
                margin-bottom: 5px;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
                // background-color: #fff;
                cursor: move;
            }
        }
    }
}
</style>