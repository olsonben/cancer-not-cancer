<script setup>
const { row, order } = defineProps(['row', 'order'])
const emit = defineEmits(['edit', 'delete', 'export'])

const editRow = () => {
    emit('edit', row)
}
const deleteRow = () => {
    emit('delete', row)
}
const exportRow = () => {
    emit('export', row)
}

const cellKey = (i) => `${row.id}-${i}`

</script>

<template>
    <tr>
        <td v-for="(propName, index) in order" :key="cellKey(index)">
            <template v-if="propName === 'progress'">
                <progress max="1" class="progress is-small is-info" :value="row[propName]">
                    {{ row[propName] }}
                </progress>
            </template>
            <template v-else-if="propName === 'action'">
                <div class="buttons is-center">
                    <button class="button is-small is-info" type="button" @click="editRow">
                        <span class="icon"><fa-icon :icon="['far', 'pen-to-square']" /></span>
                    </button>
                    <button class="button is-small is-danger" type="button" @click="deleteRow">
                        <span class="icon"><fa-icon :icon="['far', 'trash-can']" /></span>
                    </button>
                    <button class="button is-small is-success" type="button" @click="exportAction">
                        <span class="icon"><fa-icon :icon="['fas', 'download']" /></span>
                    </button>
                </div>
            </template>
            <template v-else>
                {{ row[propName] }}
            </template>
        </td>
    </tr>
</template>