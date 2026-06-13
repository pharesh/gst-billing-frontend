import { defineStore } from 'pinia'

export const useFlashStore = defineStore('flash', {
    state: () => ({
        success: null,
        error:   null,
        info:    null,
    }),

    actions: {
        set(type, msg) {
            this[type] = msg
            setTimeout(() => { this[type] = null }, 5000)
        },

        clear() {
            this.$patch({ success: null, error: null, info: null })
        },
    },
})
