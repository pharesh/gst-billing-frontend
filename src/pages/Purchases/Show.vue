<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Bill #{{ purchase?.bill_number }}</h2>
        <div class="flex gap-2">
          <RouterLink :to="'/purchases/' + route.params.id + '/edit'" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Edit</RouterLink>
          <RouterLink to="/purchases" class="text-sm text-indigo-600 hover:underline self-center">← Purchases</RouterLink>
        </div>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-4">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <template v-else>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="grid grid-cols-3 gap-4 text-sm mb-6">
              <div><span class="text-gray-500">Supplier</span><div class="font-medium mt-0.5">{{ purchase.supplier_name }}</div></div>
              <div><span class="text-gray-500">Bill Date</span><div class="mt-0.5">{{ purchase.bill_date }}</div></div>
              <div><span class="text-gray-500">Due Date</span><div class="mt-0.5">{{ purchase.due_date || '—' }}</div></div>
              <div><span class="text-gray-500">Status</span><div class="mt-0.5"><span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{{ purchase.status }}</span></div></div>
              <div><span class="text-gray-500">ITC Available</span><div class="font-bold text-green-700 mt-0.5">₹{{ fmt(purchase.total_gst) }}</div></div>
            </div>

            <table class="w-full text-sm border-t">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                  <th class="px-3 py-2 text-left font-medium text-gray-600">HSN</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">Qty</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">Price</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">GST</th>
                  <th class="px-3 py-2 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in purchase.items" :key="item.id">
                  <td class="px-3 py-2">{{ item.description }}</td>
                  <td class="px-3 py-2 font-mono text-xs">{{ item.hsn_code || '—' }}</td>
                  <td class="px-3 py-2 text-right">{{ item.quantity }}</td>
                  <td class="px-3 py-2 text-right">₹{{ fmt(item.unit_price) }}</td>
                  <td class="px-3 py-2 text-right">{{ item.gst_rate }}%</td>
                  <td class="px-3 py-2 text-right font-medium">₹{{ fmt(item.total_amount) }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t-2">
                <tr><td colspan="5" class="px-3 py-2 text-right font-bold">Total</td><td class="px-3 py-2 text-right font-bold text-indigo-700">₹{{ fmt(purchase.total_amount) }}</td></tr>
              </tfoot>
            </table>
          </div>
        </template>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route = useRoute()
const loading = ref(true); const purchase = ref(null)

async function loadData() {
    loading.value = true
    try { const { data } = await api.get('/purchases/' + route.params.id); purchase.value = data.purchase } finally { loading.value = false }
}
function fmt(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
