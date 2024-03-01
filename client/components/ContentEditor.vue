<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
// import Image from '@tiptap/extension-image'


const props = defineProps({
        initialContent: { type: String, default: '' },
})

const changeFormat = ref(false)

const emit = defineEmits(['update'])
const editor = useEditor({
    content: props.initialContent,
    extensions: [
        StarterKit.configure({
            heading: {
                HTMLAttributes: {
                    class: 'title'
                }
            }
        }),
        // Image.configure({
        //     allowBase64: true,
        //     inline: true
        // })
    ],
    onUpdate: () => {
        emit('update', editor.value.getHTML())
    }
})

/**
 * Editor methods
 */

const paragraphNode = () => {
    editor.value.chain().focus().setParagraph().run()
}
const headerNode = (level) => {
    editor.value.chain().focus().toggleHeading({ level: level }).run()
}
const heading1 = () => { headerNode(1) }
const heading2 = () => { headerNode(2) }
const heading3 = () => { headerNode(3) }
const heading4 = () => { headerNode(4) }
const heading5 = () => { headerNode(5) }
const heading6 = () => { headerNode(6) }

const isParagraph = computed(() => { return editor.value.isActive('paragraph') })
const isHeading1 = computed(() => { return editor.value.isActive('heading', { level: 1 }) })
const isHeading2 = computed(() => { return editor.value.isActive('heading', { level: 2 }) })
const isHeading3 = computed(() => { return editor.value.isActive('heading', { level: 3 }) })
const isHeading4 = computed(() => { return editor.value.isActive('heading', { level: 4 }) })
const isHeading5 = computed(() => { return editor.value.isActive('heading', { level: 5 }) })
const isHeading6 = computed(() => { return editor.value.isActive('heading', { level: 6 }) })

const clearFormatting = () => {
    editor.value.chain().focus().clearNodes().run()
    editor.value.chain().focus().unsetAllMarks().run()
}

const handleFocusOut = (event) => {
    if (!event.currentTarget.contains(event.explicitOriginalTarget)) {
        changeFormat.value = false
    }
}

// TODO: implement image upload
// for (let i = 0; i < rawData.length; i += filesPerRequest) {
//     const uploadBlock = rawData.slice(i, i + filesPerRequest)
//     // image upload requires submittion via form data 
//     const formData = new FormData
//     for (const fileObj of uploadBlock) {
//         formData.append(fileObj.key, fileObj.file, fileObj.fileName)
//     }
//     if (i + filesPerRequest >= rawData.length) {
//         uploadHeader['finalblock'] = true
//     }

//     const { response } = await api.POST('/images/', formData, null, uploadHeader)

// const insertImage = (event) => {
//     event.preventDefault()
//     const items = event.dataTransfer.items;

//     for (let i = 0; i < items.length; i++) {
//         if (items[i].type.indexOf("image") !== -1) {
//             //image
//             const file = items[i].getAsFile();

//             let reader = new FileReader()
//             reader.readAsDataURL(file)
//             reader.onloadend = function () {
//                 editor.value.chain().focus().setImage({ src: reader.result }).run()
//             }

//         }
//     }
// }

</script>

<template>
        <div class="box">
           <div class="buttons" v-if="editor">
                <div class="dropdown" :class="{ 'is-active': changeFormat }" @click="changeFormat = !changeFormat" @focusout="handleFocusOut">
                    <div class="dropdown-trigger mr-2">
                        <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu">
                            <span>Format</span>
                            <span class="icon is-small">
                                <fa-icon :icon="['fas', 'angle-down']" />
                            </span>
                        </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            <div class="dropdown-item content m-0 is-small clickable" :class="{ 'is-active': isParagraph }" @click="paragraphNode">
                                <p>Paragraph</p>
                            </div>
                            <div class="dropdown-item content m-0 is-small clickable" :class="{ 'is-active': isHeading1 }" @click="heading1">
                                <h1 class="m-0">Heading 1</h1>
                            </div>
                            <div class="dropdown-item content m-0 is-small clickable" :class="{ 'is-active': isHeading2 }" @click="heading2">
                                <h2 class="m-0">Heading 2</h2>
                            </div>
                            <div class="dropdown-item content m-0 is-small clickable" :class="{ 'is-active': isHeading3 }" @click="heading3">
                                <h3 class="m-0">Heading 3</h3>
                            </div>
                            <div class="dropdown-item content m-0 is-small clickable" :class="{ 'is-active': isHeading4 }" @click="heading4">
                                <h4 class="m-0">Heading 4</h4>
                            </div>
                            <div class="dropdown-item content m-0 is-small clickable" :class="{ 'is-active': isHeading5 }" @click="heading5">
                                <h5 class="m-0">Heading 5</h5>
                            </div>
                            <div class="dropdown-item content m-0 is-small clickable" :class="{ 'is-active': isHeading6 }" @click="heading6">
                                <h6 class="m-0">Heading 6</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="button is-small" type="button" @click="editor.chain().focus().toggleBold().run()" :disabled="!editor.can().chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
                    <span class="icon"><fa-icon :icon="['fas', 'b']" /></span>
                </button>
                <button class="button is-small" type="button" @click="editor.chain().focus().toggleItalic().run()" :disabled="!editor.can().chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
                    <span class="icon"><fa-icon :icon="['fas', 'italic']" /></span>
                </button>
                <button class="button is-small" type="button" @click="editor.chain().focus().toggleStrike().run()" :disabled="!editor.can().chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
                    <span class="icon"><fa-icon :icon="['fas', 'strikethrough']" /></span>
                </button>
                <button class="button is-small" type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
                    <span class="icon"><fa-icon :icon="['fas', 'list-ul']" /></span>
                </button>
                <button class="button is-small" type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
                    <span class="icon"><fa-icon :icon="['fas', 'list-ol']" /></span>
                </button>
                <button class="button is-small" type="button" @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
                    <span class="icon"><fa-icon :icon="['fas', 'quote-left']" /></span>
                </button>
                <button class="button is-small" type="button" @click="editor.chain().focus().toggleCode().run()" :disabled="!editor.can().chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
                    <span class="icon"><fa-icon :icon="['fas', 'code']" /></span>
                </button>
                <button class="button is-small" type="button" @click="clearFormatting">
                    <span class="icon"><fa-icon :icon="['fas', 'remove-format']" /></span>
                </button>
                <button class="button is-small" type="button" @click="editor.chain().focus().setHorizontalRule().run()">
                    <span class="has-text-weight-bold">—</span>
                </button>
            </div> 
        </div>
        
        <div class="field">
            <div class="box">

                <div class="control content">
                    <!-- Add @drop="insertImage" for image handling -->
                    <EditorContent :editor="editor" />
                </div>
            </div>
        </div>
</template>

<style lang="scss" scoped>
.clickable {
    cursor: pointer;
    &:hover {
        background-color: hsl(0, 0%, 96%);
    }

    &.is-active {
        background-color: $info;
        
        h1, h2, h3, h4, h5, h6, p {
            color: #fff;
        }
    }
}
// Scoped styles do not affect v-html content! Use ::v-deep
// note: I don't think we are using vue-loader, but the same applies.
// https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors
:deep(img.ProseMirror-selectednode) {
    outline: 3px solid $info;
}

</style>