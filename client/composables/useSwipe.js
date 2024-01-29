/*************************************************************
    * Swipes
    * Modified from https://stackoverflow.com/a/23230280/16755079
    *************************************************************/

export const useSwipe = (target, onSwipe, threshold) => {
    console.log('useSwipe')
    console.log(target)

    onMounted(() => {
        console.log('THis is the useSwipe onMounted')
        console.log(document)
    })
    
    const startPoint = reactive({ x: 0, y: 0})
    const endPoint = reactive({ x: 0, y: 0})
    
    const xDiff = computed(() => endPoint.x - startPoint.x)
    const yDiff = computed(() => endPoint.y - startPoint.y)

    const getTouchPoint = (evt) => {
        return {
            x: evt.touches[0].clientX,
            y: evt.touches[0].clientY
        }
    }

    const updateStartPoint = (point) => {
        startPoint.x = point.x
        startPoint.y = point.y
    }

    const updateEndPoint = (point) => {
        endPoint.x = point.x
        endPoint.y = point.y
    }

    const handleTouchStart = (evt) => {
        // skip multitouch
        if (evt.touches.length !== 1) {
            return
        }
        // evt.preventDefault();
        const point = getTouchPoint(evt)
        updateStartPoint(point)
        updateEndPoint(point)
    }
    
    const handleTouchMove = (evt) => {
        if (evt.touches.length !== 1) {
            return
        }

        const point = getTouchPoint(evt)
        updateEndPoint(point)


        // this.touchMacro(event, 0, undefined,
        //     () => {
        //         // Swapping movement flags
        //         // console.log("right")
        //         if (this.percent <= -1) {
        //             this.moveLeft = false
        //             this.moveRight = true
        //         } else {
        //             this.moveLeft = false
        //             this.moveRight = false
        //         }
        //     },
        //     undefined,
        //     () => {
        //         // console.log("left")
        //         if (this.percent >= 1) {
        //             this.moveLeft = true
        //             this.moveRight = false
        //         } else {
        //             this.moveLeft = false
        //             this.moveRight = false
        //         }
        //     })
    }
    const handleTouchEnd = (evt) => {
        // -xDiff == left
        // -yDiff == up
        console.log(xDiff.value, yDiff.value)
        // if (touchEvent != null) {
        //     const touchList = touchEvent.touches || touchEvent.originalEvent.touches
        //     if (touchList.length == 1) {
        //         // touchend event has an empty `touches` list, so we pass the touchmove event instead
        //         // this.touchMacro(this.touchEvent, this.swipeDistance, () => {
        //         //     this.commenting = true
        //         // }, () => {
        //         //     this.onClick('yes-cancer')
        //         // }, () => {
        //         //     // this.onClick('maybe-cancer')
        //         //     this.commenting = false
        //         // }, () => {
        //         //     this.onClick('no-cancer')
        //         // })
        //     }
        // }


    }


    return {
        xDistance: xDiff,
        activate() {
            // Fixes a firefox swipe conflict. When swiping if the reload page
            // swipe starts to engage, other animations freeze and hang. The
            // following line deactivates swiping to reload page.
            document.documentElement.style.setProperty('--overscroll', 'none')
            // Turn scrolling off
            document.documentElement.style.setProperty('--overflow', 'hidden')

            // Required for touches
            document.addEventListener('touchstart', handleTouchStart, false)
            document.addEventListener('touchmove', handleTouchMove, false)
            document.addEventListener('touchend', handleTouchEnd, false)

            console.log(target.value)
        },
        deactivate() {
            // Reactivates swipe to reload (deactivated in the mount method)
            document.documentElement.style.setProperty('--overscroll', 'auto')
            // Allowing scrolling
            document.documentElement.style.setProperty('--overflow', 'initial')

            // We need to cleanup our event listeners. So we don't have duplicates when we return.
            document.removeEventListener('touchstart', handleTouchStart, false)
            document.removeEventListener('touchmove', handleTouchMove, false)
            document.removeEventListener('touchend', handleTouchEnd, false)
        }
    }

}