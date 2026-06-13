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

        success(msg) { this.set('success', msg) },
        error(msg)   { this.set('error', msg)   },
        info(msg)    { this.set('info', msg)     },
        clear()      { this.success = this.error = this.info = null },
    },
})
