<template>
  <AuthenticatedLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Quotations / Proforma Invoices</h2>
        <RouterLink to="/quotations/create" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">+ New Quotation</RouterLink>
      </div>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex gap-3 items-center">
            <input v-model="search" @keydown.enter="applyFilters" type="text" placeholder="Search by quote # or customer..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <select v-model="status" class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-44">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="converted">Converted</option>
            </select>
            <button @click="applyFilters" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Filter</button>
            <button @click="clearFilters" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-600">Clear</button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-gray-600">Quote #</th>
                <th class="px-4 py-3 font-medium text-gray-600">Customer</th>
                <th class="px-4 py-3 font-medium text-gray-600">Date</th>
                <th class="px-4 py-3 font-medium text-gray-600">Valid Until</th>
                <th class="px-4 py-3 font-medium text-gray-600 text-right">Amount</th>
                <th class="px-4 py-3 font-medium text-gray-600">Status</th>
                <th class="px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="q in quotations.data" :key="q.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-mono font-medium text-indigo-600">
                  <RouterLink :to="`/quotations/${q.id}`">{{ q.quotation_number }}</RouterLink>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ q.customer?.name }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ q.quotation_date }}</td>
                <td class="px-4 py-3 text-xs text-gray-500">{{ q.valid_until || '—' }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ fmt(q.total_amount) }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusClass(q.status)">
                    {{ q.status?.toUpperCase() }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <RouterLink :to="`/quotations/${q.id}`" class="text-indigo-600 hover:underline text-xs">View</RouterLink>
                    <a :href="`${apiBase}/quotations/${q.id}/download`" class="text-gray-600 hover:underline text-xs">PDF</a>
                  </div>
                </td>
              </tr>
              <tr v-if="!quotations.data?.length">
                <td colspan="7" class="px-4 py-10 text-center text-gray-400">No quotations found.</td>
              </tr>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t flex justify-between text-sm text-gray-500">
            <span>Showing {{ quotations.from ?? 0 }}–{{ quotations.to ?? 0 }} of {{ quotations.total ?? 0 }}</span>
            <div class="flex gap-2">
              <button v-if="quotations.current_page > 1" @click="goToPage(quotations.current_page - 1)" class="text-indigo-600 hover:underline">← Prev</button>
              <button v-if="quotations.current_page < quotations.last_page" @click="goToPage(quotations.current_page + 1)" class="text-indigo-600 hover:underline">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import api from '@/api/index.js'

const route   = useRoute()
const router  = useRouter()
const apiBase = import.meta.env.VITE_API_URL

const quotations = ref({ data: [], total: 0, current_page: 1, last_page: 1 })
const search     = ref(route.query.search ?? '')
const status     = ref(route.query.status ?? '')
const page       = ref(route.query.page ?? 1)

async function loadData() {
    const { data } = await api.get('/quotations', { params: { search: search.value, status: status.value, page: page.value } })
    quotations.value = data.quotations
}

function applyFilters() { page.value = 1; router.push({ query: buildQuery() }) }
function clearFilters() { search.value = ''; status.value = ''; page.value = 1; router.push({ query: {} }) }
function goToPage(p) { page.value = p; router.push({ query: buildQuery() }) }
function buildQuery() {
    const q = {}
    if (search.value) q.search = search.value
    if (status.value) q.status = status.value
    if (page.value > 1) q.page = page.value
    return q
}

function statusClass(s) {
    return { draft: 'bg-gray-100 text-gray-600', sent: 'bg-blue-100 text-blue-700', accepted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', converted: 'bg-purple-100 text-purple-700' }[s] ?? 'bg-gray-100 text-gray-600'
}
function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }

watch(() => route.query, () => { search.value = route.query.search ?? ''; status.value = route.query.status ?? ''; page.value = route.query.page ?? 1; loadData() })
onMounted(loadData)
</script>
