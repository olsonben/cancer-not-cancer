export const usePlaceholder = () => {


    return {
        generate(size) {
            const element = document.createElement('canvas')
            const context = element.getContext('2d')

            element.width = size;
            element.height = size;

            // Fill
            context.fillStyle = '#aaaaaa'
            context.fillRect(0, 0, size, size)

            // Text
            context.font = 'bold 60px sans-serif'
            context.fillStyle = '#333333'
            context.textAlign = 'left'
            context.textBaseline = 'top'
            context.fillText(`${size}x${size}`, 5, 5)

            // return element
            return element.toDataURL()
        }
    }

}