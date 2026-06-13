import { ref } from 'vue'
import api from '@/api/index.js'
import { useFlashStore } from '@/stores/flash.js'

export function useApi() {
    const flash      = useFlashStore()
    const errors     = ref({})
    const processing = ref(false)

    async function submit(method, url, data = {}, opts = {}) {
        processing.value = true
        errors.value     = {}
        try {
            const response = method === 'get'
                ? await api.get(url, { params: data })
                : await api[method](url, data)
            if (response.data?.message) flash.set('success', response.data.message)
            opts.onSuccess?.(response.data)
            return response.data
        } catch (err) {
            if (err.response?.status === 422) {
                errors.value = err.response.data.errors ?? {}
                const firstError = Object.values(errors.value)[0]?.[0]
                if (firstError) flash.set('error', firstError)
            } else {
                flash.set('error', err.response?.data?.message ?? 'Something went wrong.')
            }
            opts.onError?.(err)
            return null
        } finally {
            processing.value = false
        }
    }

    return { submit, errors, processing }
}
