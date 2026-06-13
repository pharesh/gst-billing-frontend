<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Purchases / Bills</h2>
        <RouterLink to="/purchases/create" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">+ Record Purchase Bill</RouterLink>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">

        <!-- ITC Summary Cards -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-xs text-gray-500">Total Purchases</div>
            <div class="text-xl font-bold text-gray-800 mt-1">{{ fmt(summary.total_purchases) }}</div>
          </div>
          <div class="bg-green-50 rounded-lg shadow p-4 border border-green-100">
            <div class="text-xs text-green-600 font-semibold">ITC Available (Total)</div>
            <div class="text-xl font-bold text-green-700 mt-1">{{ fmt(summary.itc_total) }}</div>
            <div class="text-xs text-green-500 mt-0.5">CGST+SGST+IGST from eligible bills</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-xs text-gray-500">ITC Breakdown</div>
            <div class="text-xs mt-2 space-y-1">
              <div class="flex justify-between"><span class="text-gray-400">CGST</span><span class="font-medium">{{ fmt(summary.itc_cgst) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">SGST</span><span class="font-medium">{{ fmt(summary.itc_sgst) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">IGST</span><span class="font-medium">{{ fmt(summary.itc_igst) }}</span></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <div class="text-xs text-red-500">Outstanding Payable</div>
            <div class="text-xl font-bold text-red-600 mt-1">{{ fmt(summary.outstanding) }}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-4 space-y-3">
          <div class="grid grid-cols-5 gap-3">
            <input v-model="filters.search" @keydown.enter="applyFilters" type="text" placeholder="Search bill # or supplier..." class="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <select v-model="filters.status" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
            <div class="flex gap-2 col-span-2">
              <button @click="applyFilters" class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Filter</button>
              <button @click="clearFilters" class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-600">Clear</button>
            </div>
          </div>
          <div class="flex gap-3 items-center">
            <span class="text-xs text-gray-500">Date range:</span>
            <input v-model="filters.date_from" type="date" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <span class="text-xs text-gray-400">to</span>
            <input v-model="filters.date_to" type="date" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <button @click="applyFilters" class="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">Apply</button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-600">Bill #</th>
                <th class="px-4 py-3 font-medium text-gray-600">Supplier</th>
                <th class="px-4 py-3 font-medium text-gray-600">Date</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Amount</th>
                <th class="px-4 py-3 font-medium text-green-600 text-right">ITC</th>
                <th class="px-4 py-3 font-medium text-gray-600">Status</th>
                <th class="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="b in bills.data" :key="b.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono font-medium text-indigo-600">
                  <RouterLink :to="`/purchases/${b.id}`">{{ b.bill_number }}</RouterLink>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ b.supplier?.name }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ b.bill_date }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ fmt(b.total_amount) }}</td>
                <td class="px-4 py-3 text-right text-xs font-medium" :class="b.itc_eligible ? 'text-green-600' : 'text-gray-400'">
                  {{ b.itc_eligible ? fmt((b.cgst_amount || 0) + (b.sgst_amount || 0) + (b.igst_amount || 0)) : 'Not eligible' }}
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(b.payment_status)">
                    {{ b.payment_status?.toUpperCase() }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <RouterLink :to="`/purchases/${b.id}`" class="text-indigo-600 hover:underline text-xs">View</RouterLink>
                </td>
              </tr>
              <tr v-if="!bills.data?.length">
                <td colspan="7" class="px-4 py-10 text-center text-gray-400">No purchase bills found.</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t flex justify-between text-sm text-gray-500">
            <span>Showing {{ bills.from ?? 0 }}–{{ bills.to ?? 0 }} of {{ bills.total ?? 0 }}</span>
            <div class="flex gap-2">
              <button v-if="bills.current_page > 1" @click="goToPage(bills.current_page - 1)" class="text-indigo-600 hover:underline">← Prev</button>
              <button v-if="bills.current_page < bills.last_page" @click="goToPage(bills.current_page + 1)" class="text-indigo-600 hover:underline">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route  = useRoute()
const router = useRouter()
const bills   = ref({ data: [], total: 0, current_page: 1, last_page: 1 })
const summary = ref({ total_purchases: 0, itc_total: 0, itc_cgst: 0, itc_sgst: 0, itc_igst: 0, outstanding: 0 })

const filters = reactive({
    search: route.query.search ?? '', status: route.query.status ?? '',
    date_from: route.query.date_from ?? '', date_to: route.query.date_to ?? '', page: route.query.page ?? 1,
})

async function loadData() {
    const { data } = await api.get('/purchases', { params: filters })
    bills.value   = data.bills
    summary.value = data.itcSummary ?? summary.value
}

function applyFilters() { filters.page = 1; router.push({ query: { ...filters } }) }
function clearFilters() { Object.assign(filters, { search: '', status: '', date_from: '', date_to: '', page: 1 }); router.push({ query: {} }) }
function goToPage(p) { filters.page = p; router.push({ query: { ...filters } }) }

function statusClass(s) { return { paid: 'bg-green-100 text-green-800', unpaid: 'bg-red-100 text-red-800', partial: 'bg-yellow-100 text-yellow-800' }[s] || '' }
function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }

watch(() => route.query, () => { Object.assign(filters, route.query); loadData() })
onMounted(loadData)
</script>
