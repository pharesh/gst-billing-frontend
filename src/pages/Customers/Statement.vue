<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Customer Statement — {{ customer?.name }}</h2>
        <RouterLink to="/customers" class="text-sm text-indigo-600 hover:underline">← Customers</RouterLink>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-5xl sm:px-6 lg:px-8 space-y-4">
        <!-- Date range filter -->
        <div class="flex gap-3 items-center">
          <input v-model="from" type="date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <span class="text-gray-500 text-sm">to</span>
          <input v-model="to" type="date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button @click="loadData" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Apply</button>
          <a :href="`${apiBase}/customers/${$route.params.id}/statement/download?from=${from}&to=${to}`" target="_blank" class="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Export PDF</a>
        </div>

        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <template v-else>
          <!-- Summary -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-white rounded-lg shadow p-5">
              <div class="text-sm text-gray-500">Total Invoiced</div>
              <div class="text-xl font-bold text-gray-900 mt-1">₹{{ fmt(summary.total_invoiced) }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-5">
              <div class="text-sm text-gray-500">Total Paid</div>
              <div class="text-xl font-bold text-green-600 mt-1">₹{{ fmt(summary.total_paid) }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-5">
              <div class="text-sm text-gray-500">Outstanding</div>
              <div class="text-xl font-bold text-red-600 mt-1">₹{{ fmt(summary.outstanding) }}</div>
            </div>
          </div>

          <!-- Transactions table -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-left">
                <tr>
                  <th class="px-4 py-3 font-medium text-gray-600">Date</th>
                  <th class="px-4 py-3 font-medium text-gray-600">Type</th>
                  <th class="px-4 py-3 font-medium text-gray-600">Reference</th>
                  <th class="px-4 py-3 font-medium text-gray-600 text-right">Amount</th>
                  <th class="px-4 py-3 font-medium text-gray-600 text-right">Balance</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-600">{{ tx.date }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs" :class="tx.type === 'payment' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">{{ tx.type }}</span>
                  </td>
                  <td class="px-4 py-3">{{ tx.reference }}</td>
                  <td class="px-4 py-3 text-right" :class="tx.type === 'payment' ? 'text-green-700' : ''">{{ tx.type === 'payment' ? '-' : '' }}₹{{ fmt(tx.amount) }}</td>
                  <td class="px-4 py-3 text-right font-medium">₹{{ fmt(tx.running_balance) }}</td>
                </tr>
                <tr v-if="!transactions.length"><td colspan="5" class="px-4 py-10 text-center text-gray-400">No transactions in this period.</td></tr>
              </tbody>
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
const loading = ref(true)
const customer = ref(null); const summary = ref({}); const transactions = ref([])
const apiBase = import.meta.env.VITE_API_URL
const now = new Date()
const from = ref(new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10))
const to = ref(now.toISOString().slice(0, 10))

async function loadData() {
    loading.value = true
    try {
        const { data } = await api.get('/customers/' + route.params.id + '/statement', { params: { from: from.value, to: to.value } })
        customer.value = data.customer; summary.value = data.summary; transactions.value = data.transactions ?? []
    } finally { loading.value = false }
}
function fmt(n) { return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
