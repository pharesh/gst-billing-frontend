<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">System Settings</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-3xl sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <form v-else @submit.prevent="save" class="bg-white rounded-lg shadow p-6 space-y-4">
          <div v-for="(value, key) in settings" :key="key">
            <label class="text-sm font-medium text-gray-700 block mb-1 capitalize">{{ key.replace(/_/g, ' ') }}</label>
            <input v-model="settings[key]" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div class="flex justify-end">
            <button type="submit" :disabled="processing" class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {{ processing ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useApi } from '@/composables/useApi.js'
import api from '@/api/index.js'

const { processing, submit } = useApi()
const loading = ref(true)
const settings = reactive({})

async function loadData() {
    const { data } = await api.get('/admin/system-settings')
    Object.assign(settings, data.settings ?? {})
    loading.value = false
}
async function save() { await submit('patch', '/admin/system-settings', settings) }
onMounted(loadData)
</script>
