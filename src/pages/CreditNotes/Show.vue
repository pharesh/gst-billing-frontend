<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Credit Note #{{ note?.credit_note_number }}</h2>
        <RouterLink to="/credit-notes" class="text-sm text-indigo-600 hover:underline">← Credit Notes</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-3xl sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <div v-else class="bg-white rounded-lg shadow p-6 space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div><span class="text-gray-500">Invoice</span><div class="mt-0.5"><RouterLink :to="'/invoices/' + note.invoice_id" class="text-indigo-600 hover:underline">{{ note.invoice_number }}</RouterLink></div></div>
            <div><span class="text-gray-500">Customer</span><div class="font-medium mt-0.5">{{ note.customer_name }}</div></div>
            <div><span class="text-gray-500">Date</span><div class="mt-0.5">{{ note.note_date }}</div></div>
            <div><span class="text-gray-500">Status</span><div class="mt-0.5"><span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{{ note.status }}</span></div></div>
            <div><span class="text-gray-500">Amount</span><div class="font-bold text-red-600 mt-0.5">₹{{ fmt(note.amount) }}</div></div>
            <div v-if="note.gst_amount"><span class="text-gray-500">GST Adjustment</span><div class="mt-0.5">₹{{ fmt(note.gst_amount) }}</div></div>
            <div class="col-span-2"><span class="text-gray-500">Reason</span><div class="mt-0.5">{{ note.reason }}</div></div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route = useRoute(); const loading = ref(true); const note = ref(null)
async function loadData() {
    loading.value = true
    try { const { data } = await api.get('/credit-notes/' + route.params.id); note.value = data.creditNote } finally { loading.value = false }
}
function fmt(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
