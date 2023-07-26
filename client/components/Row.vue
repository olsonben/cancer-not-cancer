<template>
    <tr>
        <td v-for="(propName, index) in order" :key="index">
            <template v-if="propName === 'progress'">
                <progress max="1" class="progress is-small is-info" :value="row[propName]">
                    {{ row[propName] }}
                </progress>
            </template>
            <template v-else-if="propName === 'action'">
                <div class="buttons is-right">
                    <button class="button is-small is-info" type="button" @click="editRow">
                        <span class="icon"><i class="cnc-pen-to-square"></i></span>
                    </button>
                    <button class="button is-small is-danger" type="button" @click="deleteRow">
                        <span class="icon"><i class="cnc-trash-can"></i></span>
                    </button>
                </div>
            </template>
            <template v-else>
                {{ row[propName] }}
            </template>
        </td>
    </tr>
</template>

<script>
    export default {
        props: ['row', 'order'],
        methods: {
            editRow() {
                this.$emit('edit', this.row)
            },
            deleteRow() {
                this.$emit('delete', this.row)
            }
        }
    }
</script>