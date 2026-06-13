<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">New Credit Note</h2>
        <RouterLink to="/credit-notes" class="text-sm text-indigo-600 hover:underline">← Credit Notes</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <form v-else @submit.prevent="save" class="space-y-4">

          <div class="bg-white rounded-lg shadow p-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Invoice *</label>
                <select v-model="form.invoice_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select invoice</option>
                  <option v-for="inv in invoices" :key="inv.id" :value="inv.id">{{ inv.invoice_number }} — {{ inv.customer_name }}</option>
                </select>
                <p v-if="errors.invoice_id" class="text-red-500 text-xs mt-1">{{ errors.invoice_id[0] }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Date *</label>
                <input v-model="form.note_date" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">Amount *</label>
                <input v-model="form.amount" type="number" min="0" step="0.01" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <p v-if="errors.amount" class="text-red-500 text-xs mt-1">{{ errors.amount[0] }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-1">GST Adjustment</label>
                <input v-model="form.gst_amount" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div class="col-span-2">
                <label class="text-sm font-medium text-gray-700 block mb-1">Reason *</label>
                <textarea v-model="form.reason" rows="2" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
                <p v-if="errors.reason" class="text-red-500 text-xs mt-1">{{ errors.reason[0] }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <RouterLink to="/credit-notes" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</RouterLink>
            <button type="submit" :disabled="processing" class="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">{{ processing ? 'Saving…' : 'Create Credit Note' }}</button>
          </div>
        </form>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useApi } from '@/composables/useApi.js'
import api from '@/api/index.js'

const router = useRouter()
const { errors, processing, submit } = useApi()
const loading = ref(true); const invoices = ref([])
const now = new Date().toISOString().slice(0, 10)
const form = reactive({ invoice_id: '', note_date: now, amount: '', gst_amount: 0, reason: '' })

async function loadData() {
    const { data } = await api.get('/credit-notes/create')
    invoices.value = data.invoices ?? []; loading.value = false
}
async function save() {
    await submit('post', '/credit-notes', form, { onSuccess: d => router.push('/credit-notes/' + d.creditNote?.id) })
}
onMounted(loadData)
</script>
