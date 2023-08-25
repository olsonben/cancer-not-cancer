<template>
    <div class="image-picker">

        <div class="menu">
            <p class="menu-label" @click="report">Images Folders</p>
            <ul class="menu-list">
                <Folder :key="'root'" v-model="root" @update="update"></Folder>
            </ul>
        </div>

    </div>
</template>

<script>
const dummyFolderData = [
    {
        id: 1,
        name: 'Folder 1',
        contents: [],
        type: 'tag',
        selected: [],
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
                        selected: true,
                    },
                    {
                        id: 496,
                        name: 'image_325.tiff',
                        type: 'img',
                        selected: false,
                    }
                ],
                type: 'tag',
                selected: [],
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
                                selected: true,
                            }
                        ],
                        type: 'tag',
                        selected: [],
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
                selected: [],
            },
            {
                id: 7,
                name: 'Folder C',
                contents: [
                    {
                        id: 1,
                        name: 'cancer_A.tiff',
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
                selected: [],
            }
        ],
        type: 'tag',
        selected: [],
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
        selected: [],
    },
]

export default {
    props: ['tags'],
    data() {
        return {
            // data: dummyFolderData,
            root: {
                id: 0,
                name: 'root',
                contents: dummyFolderData,
                type: 'tag',
                selected: [],
            },
            test: [],
            expanded: false,
        }
    },
    computed: {
    },
    watch: {      
    },
    methods: {
        report() {
            console.log(this.$common.getSelectedFiles(this.root))
        },
        update() {
            console.log('Data has changed.')
        }
    }
}
</script>

<style lang='scss' scoped>
.image-picker {
    // max-height: 300px;
    // overflow-y: scroll;
    transition: 0.5s ease;
    border: 1px solid $primary;

    .menu {
        max-height: 300px;
        overflow-y: scroll;
    }

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