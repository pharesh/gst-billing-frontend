<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">System Settings</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-3xl sm:px-6 lg:px-8 space-y-6">

        <div v-if="loading" class="text-center py-12 text-gray-400">Loading settings…</div>
        <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{{ loadError }}</div>

        <template v-else>
          <div v-for="(items, group) in grouped" :key="group" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">{{ groupLabel(group) }}</h3>
            </div>
            <div class="divide-y divide-gray-100">
              <div v-for="s in items" :key="s.key" class="px-6 py-4 flex items-start gap-4">
                <div class="flex-1 min-w-0">
                  <label class="block text-sm font-medium text-gray-800 mb-0.5">{{ s.label || s.key }}</label>
                  <p v-if="s.description" class="text-xs text-gray-500 mb-2">{{ s.description }}</p>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="values[s.key]"
                      :type="s.encrypted ? 'password' : 'text'"
                      :placeholder="s.encrypted && s.is_set ? '●●●● (set — leave blank to keep)' : s.key"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                    <span v-if="s.encrypted && s.is_set" class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Set</span>
                    <span v-else-if="s.encrypted && !s.is_set" class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Not set</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="saveError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{{ saveError }}</div>
          <div v-if="saveSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">Settings saved successfully.</div>

          <div class="flex justify-end">
            <button @click="save" :disabled="saving" class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {{ saving ? 'Saving…' : 'Save Settings' }}
            </button>
          </div>
        </template>

      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const loading = ref(true)
const saving = ref(false)
const loadError = ref(null)
const saveError = ref(null)
const saveSuccess = ref(false)

const grouped = ref({})
const values = reactive({})

const GROUP_LABELS = {
    mail: 'Mail / SMTP',
    razorpay: 'Razorpay Payments',
    whatsapp: 'WhatsApp',
    aws: 'AWS / S3',
    general: 'General',
    security: 'Security',
    niceinvoice: 'e-Invoice (NIC)',
    resend: 'Resend Email',
}

function groupLabel(g) {
    return GROUP_LABELS[g?.toLowerCase()] ?? g?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) ?? g
}

async function loadData() {
    try {
        const { data } = await api.get('/admin/system-settings')
        grouped.value = data.settings ?? {}
        for (const items of Object.values(grouped.value)) {
            for (const s of items) {
                values[s.key] = s.value ?? ''
            }
        }
    } catch (e) {
        loadError.value = e.response?.data?.message ?? 'Failed to load settings.'
    } finally {
        loading.value = false
    }
}

async function save() {
    saving.value = true
    saveError.value = null
    saveSuccess.value = false

    const payload = []
    for (const items of Object.values(grouped.value)) {
        for (const s of items) {
            const v = values[s.key]
            if (s.encrypted && (!v || v === '')) continue
            if (v !== null && v !== undefined && v !== '') {
                payload.push({ key: s.key, value: String(v) })
            }
        }
    }

    try {
        await api.put('/admin/system-settings', { settings: payload })
        saveSuccess.value = true
        setTimeout(() => saveSuccess.value = false, 3000)
    } catch (e) {
        saveError.value = e.response?.data?.message ?? 'Failed to save settings.'
    } finally {
        saving.value = false
    }
}

onMounted(loadData)
</script>
