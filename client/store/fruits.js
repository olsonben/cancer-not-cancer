export const state = () => {
    fruits: ['Apple']
}

export const mutations = {
    addFruit(state, fruit) {
        state.fruits.push(fruit)
    },
    removeFruit(state, fruitId) {
        state.fruits = state.fruits.filter((fruit) => fruit.id !== fruitId)
    }
}

export const actions = {
    addFruit(context, fruit) {
        const slicedFruit = sliceFruit(fruit)
        context.commit(slicedFruit)
    }
}

export const getters = {
    getApples: (state) => {
        return state.fruits.filter((fruit) => fruit.type === 'Apple')
    }
}