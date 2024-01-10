<template>
    <tr>
        <td v-for="(propName, index) in order" :key="index">
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

<script>
    export default {
        props: ['row', 'order'],
        emits: ['edit', 'delete', 'export'],
        methods: {
            editRow() {
                this.$emit('edit', this.row)
            },
            deleteRow() {
                this.$emit('delete', this.row)
            },
            exportAction() {
                this.$emit('export', this.row)
            }
        }
    }
</script>