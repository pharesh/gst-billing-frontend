<template>
  <AuthenticatedLayout>
    <template #header><h2 class="text-xl font-semibold text-gray-800">Aging Report</h2></template>
    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <div v-else class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-600">Customer</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Current</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">1-30 days</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">31-60 days</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">61-90 days</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">90+ days</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in agingData" :key="row.customer_id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">{{ row.customer_name }}</td>
                <td class="px-4 py-3 text-right">{{ fmt(row.current) }}</td>
                <td class="px-4 py-3 text-right" :class="row['1_30'] > 0 ? 'text-yellow-600' : ''">{{ fmt(row['1_30']) }}</td>
                <td class="px-4 py-3 text-right" :class="row['31_60'] > 0 ? 'text-orange-600' : ''">{{ fmt(row['31_60']) }}</td>
                <td class="px-4 py-3 text-right" :class="row['61_90'] > 0 ? 'text-red-500' : ''">{{ fmt(row['61_90']) }}</td>
                <td class="px-4 py-3 text-right" :class="row['90_plus'] > 0 ? 'text-red-700 font-semibold' : ''">{{ fmt(row['90_plus']) }}</td>
                <td class="px-4 py-3 text-right font-bold">{{ fmt(row.total) }}</td>
              </tr>
              <tr v-if="!agingData.length">
                <td colspan="7" class="px-4 py-10 text-center text-gray-400">No outstanding receivables.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const loading   = ref(true)
const agingData = ref([])

async function loadData() {
    loading.value = true
    try {
        const { data } = await api.get('/reports/aging')
        agingData.value = data.aging ?? data
    } finally { loading.value = false }
}
function fmt(n) { return n > 0 ? '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—' }
onMounted(loadData)
</script>
