<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Quotation #{{ quotation?.quotation_number }}</h2>
        <div class="flex gap-2">
          <RouterLink :to="'/quotations/' + $route.params.id + '/edit'" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Edit</RouterLink>
          <a :href="`${apiBase}/quotations/${$route.params.id}/download`" target="_blank" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Download PDF</a>
          <RouterLink to="/quotations" class="text-sm text-indigo-600 hover:underline self-center">← Quotations</RouterLink>
        </div>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-4">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <template v-else>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><span class="text-gray-500">Customer</span><div class="font-medium mt-0.5">{{ quotation.customer_name }}</div></div>
              <div><span class="text-gray-500">Valid Until</span><div class="mt-0.5">{{ quotation.valid_until || '—' }}</div></div>
              <div><span class="text-gray-500">Status</span><div class="mt-0.5"><span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{{ quotation.status }}</span></div></div>
              <div v-if="quotation.notes"><span class="text-gray-500">Notes</span><div class="mt-0.5">{{ quotation.notes }}</div></div>
            </div>

            <table class="w-full text-sm border-t">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">Qty</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">Price</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">GST</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in quotation.items" :key="item.id">
                  <td class="px-3 py-2">{{ item.description }}</td>
                  <td class="px-3 py-2 text-right">{{ item.quantity }}</td>
                  <td class="px-3 py-2 text-right">₹{{ fmt(item.unit_price) }}</td>
                  <td class="px-3 py-2 text-right">{{ item.gst_rate }}%</td>
                  <td class="px-3 py-2 text-right font-medium">₹{{ fmt(item.total_amount) }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t-2">
                <tr><td colspan="4" class="px-3 py-2 text-right font-bold">Total</td><td class="px-3 py-2 text-right font-bold text-indigo-700">₹{{ fmt(quotation.total_amount) }}</td></tr>
              </tfoot>
            </table>
          </div>

          <!-- Convert to Invoice -->
          <div class="bg-white rounded-lg shadow p-6">
            <button @click="convertToInvoice" :disabled="converting" class="px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
              {{ converting ? 'Converting…' : 'Convert to Invoice' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route = useRoute(); const router = useRouter()
const loading = ref(true); const converting = ref(false); const quotation = ref(null)
const apiBase = import.meta.env.VITE_API_URL

async function loadData() {
    loading.value = true
    try { const { data } = await api.get('/quotations/' + route.params.id); quotation.value = data.quotation } finally { loading.value = false }
}
async function convertToInvoice() {
    if (!confirm('Convert this quotation to an invoice?')) return
    converting.value = true
    try { const { data } = await api.post('/quotations/' + route.params.id + '/convert'); router.push('/invoices/' + data.invoice.id) } finally { converting.value = false }
}
function fmt(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
