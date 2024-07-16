<script setup>
const props = defineProps({
    tableData: { type: Object, required: true },
})

const headers = computed(() => props.tableData.columns)
const body = computed(() => props.tableData.bodyData)
const indexProp = computed(() => props.tableData.indexProp)
const order = computed(() => props.tableData.order)

const selected = ref(null)
const selectRow = (rowNumber) => {
    selected.value = rowNumber
}
</script>

<template>
    <table class="table is-striped is-narrow">
        <thead>
            <tr>
                <th v-for="header in headers">{{ header }}</th>
            </tr>
        </thead>
        <tbody>
            <Row v-for="(row, index) in body" :key="`${row[indexProp]}-${props.tableData.tableId}`"
                :class="{ 'is-selected': selected == index}" :row="row" :order="order"
                @click="() => selectRow(index)" />
        </tbody>
    </table>
</template>

<style lang="scss" scoped>
/* CSS for the current page */
.table {
    font-size: 0.8rem;
    width: 100%;
    border-color: hsl(0deg, 0%, 86%);
    border-width: 1px;
    border-style: solid;
}
</style>