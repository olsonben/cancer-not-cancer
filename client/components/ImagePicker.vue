<template>
    <div class="image-picker">

        <aside class="menu">
            <p class="menu-label">Images Folders</p>
            <ul class="menu-list">
                <File v-for="aFile in data" :key="aFile.id" :file="aFile" @selected="itemSelected"></File>
            </ul>
        </aside>

    </div>
</template>

<script>
const dummyFolderData = [
    {
        id: 1,
        name: 'Folder 1',
        contents: [],
        type: 'tag',
        selected: false,
    },
    {
        id: 2,
        name: 'Folder 2',
        contents: [
            {
                id: 5,
                name: 'Folder A',
                contents: [
                    {
                        id: 495,
                        name: 'image_324.tiff',
                        type: 'img',
                        selected: false,
                    },
                    {
                        id: 496,
                        name: 'image_325.tiff',
                        type: 'img',
                        selected: false,
                    }
                ],
                type: 'tag',
                selected: false,
            },
            {
                id: 6,
                name: 'Folder B',
                contents: [
                    {
                        id: 100,
                        name: 'Positive Set',
                        contents: [
                            {
                                id: 45,
                                name: 'carcinoma_2.tiff',
                                type: 'img',
                                selected: false,
                            },
                            {
                                id: 46,
                                name: 'carcinoma_3.tiff',
                                type: 'img',
                                selected: false,
                            }
                        ],
                        type: 'tag',
                        selected: false,
                    },
                    {
                        id: 2893,
                        name: 'pizza_22.tiff',
                        type: 'img',
                        selected: false,
                    },
                    {
                        id: 2894,
                        name: 'pizza_23.tiff',
                        type: 'img',
                        selected: false,
                    }
                ],
                type: 'tag',
                selected: false,
            },
            {
                id: 7,
                name: 'Folder C',
                contents: [
                    {
                        id: 1,
                        name: 'cancer_A.tiff',
                        contents: [],
                        type: 'img',
                        selected: false,
                    },
                    {
                        id: 2,
                        name: 'cancer_Z.tiff',
                        type: 'img',
                        selected: false,
                    }
                ],
                type: 'tag',
                selected: false,
            }
        ],
        type: 'tag',
        selected: false,
    },
    {
        id: 3,
        name: 'Folder 3',
        contents: [
            {
                id: 13,
                name: 'blood_parasite_1.tiff',
                type: 'img',
                selected: false,
            },
            {
                id: 24,
                name: 'blood_parasite_2.tiff',
                type: 'img',
                selected: false,
            }
        ],
        type: 'tag',
        selected: false,
    },
]

export default {
    props: ['tags'],
    data() {
        return {
            data: dummyFolderData,
        }
    },
    computed: {
        localTags() {
            return {
                applied: Array.from(this.tags.applied),
                available: Array.from(this.tags.available),
            }
        }
    },
    watch: {
        data: {
            handler(newData) {
                console.log('Data Change')
                console.log(this.getSelectedArray(newData))
            }
        }
        
    },
    methods: {
        itemSelected(iArray) {
            console.log('IMAGE PICKER')
            console.log(iArray)
        },
        getSelectedArray(dataArray, memo=[]) {
            for (const item of dataArray) {
                memo = this.getSubSelectedArray(child, memo)
            }
            return memo
        },
        getSubSelectedArray(parent, memo=[]) {
            memo.push(parent.id)
            for (const child of parent.contents) {
                memo = this.getSubSelectedArray(child, memo)
            }
            return memo
        },
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
.image-picker {
    max-height: 300px;
    overflow-y: scroll;
    transition: 0.5s ease;
    border: 1px solid $primary;

//     ul a +ul {
//         max-height:0;
//         overflow:hidden;
//         transition:0.5s linear;
//     }

//     ul a:focus + ul {
//         max-height:15em;
//     }
// /* only select that link , here using the href attribute */
//     a[href="#"]:focus {
//         pointer-events: none;
//     }

    // .column {
    //     margin: 10px;
    //     border: 1px solid #ccc;
    //     border-radius: 4px;

    //     ul {
    //         list-style: none;
    //         padding: 0;

    //         li {
    //             margin-bottom: 5px;
    //             padding: 5px;
    //             border: 1px solid #ddd;
    //             border-radius: 4px;
    //             cursor: move;
    //         }
    //     }
    // }
}
</style>