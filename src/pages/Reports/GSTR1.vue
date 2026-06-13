<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">GSTR-1 — {{ MONTHS[month] }} {{ year }}</h2>
        <div class="flex gap-2">
          <select v-model="month" @change="loadData" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option v-for="(m, i) in MONTHS.slice(1)" :key="i+1" :value="i+1">{{ m }}</option>
          </select>
          <select v-model="year" @change="loadData" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <a :href="`${apiBase}/reports/gstr1/download?month=${month}&year=${year}`" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Download JSON</a>
        </div>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <template v-else>

          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-xs text-gray-500 uppercase mb-1">Total Invoices</div>
              <div class="text-2xl font-bold text-gray-900">{{ reportData.summary?.total_invoices ?? 0 }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-xs text-gray-500 uppercase mb-1">Taxable Value</div>
              <div class="text-xl font-bold text-gray-900">{{ fmt(reportData.summary?.total_taxable_value) }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-xs text-gray-500 uppercase mb-1">Total Tax</div>
              <div class="text-xl font-bold text-indigo-700">{{ fmt((reportData.summary?.total_igst || 0) + (reportData.summary?.total_cgst || 0) + (reportData.summary?.total_sgst || 0)) }}</div>
            </div>
            <div class="bg-white rounded-lg shadow p-4">
              <div class="text-xs text-gray-500 uppercase mb-1">Invoice Value</div>
              <div class="text-xl font-bold text-gray-900">{{ fmt(reportData.summary?.total_invoice_value) }}</div>
            </div>
          </div>

          <!-- B2B Table -->
          <div v-if="reportData.b2b?.length" class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b"><h3 class="font-semibold text-gray-800">B2B Invoices</h3></div>
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-left">
                <tr>
                  <th class="px-4 py-3 font-medium text-gray-600">Customer GSTIN</th>
                  <th class="px-4 py-3 font-medium text-gray-600">Invoice #</th>
                  <th class="px-4 py-3 font-medium text-gray-600">Date</th>
                  <th class="px-4 py-3 font-medium text-gray-600 text-right">Taxable</th>
                  <th class="px-4 py-3 font-medium text-gray-600 text-right">IGST</th>
                  <th class="px-4 py-3 font-medium text-gray-600 text-right">CGST</th>
                  <th class="px-4 py-3 font-medium text-gray-600 text-right">SGST</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="inv in reportData.b2b" :key="inv.invoice_number" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ inv.gstin }}</td>
                  <td class="px-4 py-3 font-mono text-indigo-600">{{ inv.invoice_number }}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ inv.invoice_date }}</td>
                  <td class="px-4 py-3 text-right">{{ fmt(inv.taxable_value) }}</td>
                  <td class="px-4 py-3 text-right">{{ fmt(inv.igst) }}</td>
                  <td class="px-4 py-3 text-right">{{ fmt(inv.cgst) }}</td>
                  <td class="px-4 py-3 text-right">{{ fmt(inv.sgst) }}</td>
                </tr>
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
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const apiBase  = import.meta.env.VITE_API_URL
const loading  = ref(true)
const reportData = ref({ summary: {}, b2b: [] })

const now   = new Date()
const month = ref(now.getMonth() + 1)
const year  = ref(now.getFullYear())
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']

async function loadData() {
    loading.value = true
    try {
        const { data } = await api.get('/reports/gstr1', { params: { month: month.value, year: year.value } })
        reportData.value = data.data ?? data
    } finally {
        loading.value = false
    }
}

function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
