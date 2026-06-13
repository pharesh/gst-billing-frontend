<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">GSTR-3B — {{ MONTHS[month] }} {{ year }}</h2>
        <div class="flex gap-2">
          <select v-model="month" @change="loadData" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option v-for="(m, i) in MONTHS.slice(1)" :key="i+1" :value="i+1">{{ m }}</option>
          </select>
          <select v-model="year" @change="loadData" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </template>
    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
        <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
        <template v-else>
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-white rounded-lg shadow p-5">
              <div class="text-sm font-semibold text-gray-800 mb-3">3.1 Outward Supplies (Sales)</div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Taxable Value</span><span class="font-medium">{{ fmt(gstr3b.outward?.taxable_value) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">IGST</span><span class="font-medium">{{ fmt(gstr3b.outward?.igst) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">CGST</span><span class="font-medium">{{ fmt(gstr3b.outward?.cgst) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">SGST</span><span class="font-medium">{{ fmt(gstr3b.outward?.sgst) }}</span></div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-5">
              <div class="text-sm font-semibold text-gray-800 mb-3">4. ITC Available (Purchases)</div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">IGST</span><span class="font-medium text-green-700">{{ fmt(gstr3b.itc?.igst) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">CGST</span><span class="font-medium text-green-700">{{ fmt(gstr3b.itc?.cgst) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">SGST</span><span class="font-medium text-green-700">{{ fmt(gstr3b.itc?.sgst) }}</span></div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-5">
              <div class="text-sm font-semibold text-gray-800 mb-3">Net Tax Payable</div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">IGST</span><span class="font-bold">{{ fmt(gstr3b.net?.igst) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">CGST</span><span class="font-bold">{{ fmt(gstr3b.net?.cgst) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">SGST</span><span class="font-bold">{{ fmt(gstr3b.net?.sgst) }}</span></div>
                <div class="flex justify-between border-t pt-2 font-bold"><span class="text-gray-800">Total</span><span class="text-indigo-700 text-base">{{ fmt(netTotal) }}</span></div>
              </div>
              <div class="mt-3 text-xs text-gray-400">File by 20th of next month</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const loading = ref(true)
const gstr3b  = ref({ outward: {}, itc: {}, net: {} })
const now   = new Date()
const month = ref(now.getMonth() + 1)
const year  = ref(now.getFullYear())
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)
const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']

const netTotal = computed(() => (gstr3b.value.net?.igst || 0) + (gstr3b.value.net?.cgst || 0) + (gstr3b.value.net?.sgst || 0))

async function loadData() {
    loading.value = true
    try {
        const { data } = await api.get('/reports/gstr3b', { params: { month: month.value, year: year.value } })
        gstr3b.value = data.data ?? data
    } finally { loading.value = false }
}
function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
onMounted(loadData)
</script>
