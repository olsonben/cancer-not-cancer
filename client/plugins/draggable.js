const createDragstartHandler = (binding) => (event) => {
    // el == event.target
    event.dataTransfer.setData('application/json', JSON.stringify(binding.value))
    event.dataTransfer.dropEffect = 'move'

    //  styling
    event.target.style.opacity = "0.5"

    // console.log(event.dataTransfer)
}

const dragendHandler = (event) => {
    // el == event.target
    // remove style
    event.target.style.opacity = '1'
}

const draggable = {
    mounted(el, binding) {
        const { value } = binding
        const { editable } = value

        if (editable) {
            el.draggable = true
        }
            
            const dragstartHandler = createDragstartHandler(binding)
    
            el.addEventListener("dragstart", dragstartHandler, false)
            el.addEventListener('dragend', dragendHandler, false)
    
            // we create a weakmap to track dragstart handlers for event listener removal
            if (!draggable.handlersMap) {
                draggable.handlersMap = new WeakMap()
            }
    
            draggable.handlersMap.set(el, dragstartHandler)
    },
    unmounted(el) {

        const dragstartHandler = draggable.handlersMap.get(el)

        el.removeEventListener('dragstart', dragstartHandler, false)
        el.removeEventListener('dragend', dragendHandler, false)

        draggable.handlersMap.delete(el)
    }
}

// Vue.directive('draggable', draggable)
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('draggable', draggable)
})